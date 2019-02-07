package go_remoteIDs

import (
	"github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/satori/go.uuid"
	"math/rand"
	"strconv"
	"sync"
	"testing"
	"time"
)

func TestJobsHandler_AddPendingJob(t *testing.T) {
	jbh, err := initJobsHandler()
	if err != nil {
		t.Error(err)
		return
	}
	if jbh == nil {
		t.Error("no JobsHandler returned")
		return
	}

	// test concurrent add
	wg := new(sync.WaitGroup)
	c := make(chan struct{})
	const adds = 1000
	wg.Add(adds)
	for i := 0; i < adds; i++ {
		go func() {
			job := Job{
				Worker: "worker",
				Order: objects.BrokerOrder{
					MessageId:  "message_id",
					Order:      strconv.Itoa(i),
					IdentityId: "identity_id",
					UserId:     "user_id",
				},
			}
			jbh.AddPendingJob(job)
			wg.Done()
		}()
	}
	go func() {
		wg.Wait()
		close(c)
	}()
	select {
	case <-c:
		return
	case <-time.After(2 * time.Second):
		t.Error("timeout waiting for concurrent AddPendingJob")
	}
	if len(jbh.pendingJobs) != adds {
		t.Errorf("expected %d pending jobs, got %d", adds, len(jbh.pendingJobs))
	}
	if len(jbh.jobsSequence) != adds {
		t.Errorf("expected %d elems in sequence list, got %d", adds, len(jbh.jobsSequence))
	}

	// test that pendingJobs and jobsSequence are synchronized by picking some jobs randomly
	rand.Seed(time.Now().Unix())
	for i := 0; i < adds/4; i++ {
		pick := rand.Intn(adds)
		jobHash := jbh.jobsSequence["worker"][pick]
		if _, ok := jbh.pendingJobs["worker"][jobHash]; !ok {
			t.Errorf("job %s is in jobsSequence map but not in pendingJobs map", jobHash)
		}
	}

}

func TestJobsHandler_ConsumePendingJobFor(t *testing.T) {
	jbh, err := initJobsHandler()
	if err != nil {
		t.Error(err)
		return
	}
	if jbh == nil {
		t.Error("no JobsHandler returned")
		return
	}
	// fill jobs queue for two different worker types
	const count = 1000 // must be an even number
	var worker string
	for i := 0; i < count; i++ {
		if i%2 == 0 {
			worker = "even"
		} else {
			worker = "odd"
		}
		jbh.AddPendingJob(Job{
			Worker: worker,
			Order: objects.BrokerOrder{
				MessageId:  "message_id",
				Order:      strconv.Itoa(i),
				IdentityId: "identity_id",
				UserId:     "user_id",
			},
		})
	}

	// consume jobs to check FIFO returns
	for i := 0; i < count; i++ {
		if i%2 == 0 {
			worker = "even"
		} else {
			worker = "odd"
		}
		job, err := jbh.ConsumePendingJobFor(worker)
		if err != nil {
			t.Error(err)
		}
		if job.Order.Order != strconv.Itoa(i) {
			t.Errorf("expected to have job #%d for worker '%s', got %s", i, worker, job.Order.Order)
		}
	}

	if len(jbh.pendingJobs) != 0 {
		t.Errorf("expected an empty pending jobs list, got %d jobs left", len(jbh.pendingJobs))
	}
	if len(jbh.jobsSequence) != 0 {
		t.Errorf("expected an empty jobs sequence list, got %d elems left", len(jbh.jobsSequence))
	}
}

func TestBuildSyncJob(t *testing.T) {
	id := objects.UUID(uuid.NewV4())
	job, err := buildSyncJob(cacheEntry{
		remoteProtocol: "email",
		userID:         id,
		remoteID:       id,
	})
	if err != nil {
		t.Error(err)
	}
	if job.Order.UserId != id.String() || job.Order.IdentityId != id.String() {
		t.Errorf("job's uuid and cacheEntry's uuid mismatch")
	}

	if job.Worker != imapWorker {
		t.Errorf("expected job to be for 'imap' worker, got %s", job.Worker)
	}
	job, err = buildSyncJob(cacheEntry{
		remoteProtocol: "bad_protocol",
		userID:         id,
		remoteID:       id,
	})
	if err == nil {
		t.Error("expected buildSyncJob returned error 'unhandled remote protocol', got nil")
	}
}
