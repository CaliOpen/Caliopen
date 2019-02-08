package go_remoteIDs

import (
	"github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/satori/go.uuid"
	"reflect"
	"strconv"
	"testing"
	"time"
)

func TestInitScheduler(t *testing.T) {
	poller.Config = PollerConfig{
		ScanInterval: 10,
	}
	sch, err := initScheduler()
	if err != nil {
		t.Error(err)
		return
	}

	// test if default dbSync command has been added to MainCron
	mainCronEntries := sch.MainCron.Entries()
	if len(mainCronEntries) != 1 {
		t.Errorf("expected scheduler has a default job in MainCron after init, got %d job(s)", len(mainCronEntries))
	}
	if reflect.TypeOf(mainCronEntries[0].Job.Run) != reflect.TypeOf(poller.fullSync) {
		t.Errorf("expected to have fullSync func as first job in MainCron, got %s", reflect.TypeOf(mainCronEntries[0].Job.Run))
	}
}

func TestScheduler_AddSyncJobFor(t *testing.T) {
	poller.Config = PollerConfig{
		ScanInterval: 10,
	}
	sch, err := initScheduler()
	if err != nil {
		t.Error(err)
		return
	}
	id := objects.UUID(uuid.NewV4())

	// test invalid pollInterval string
	_, err = sch.AddSyncJobFor(cacheEntry{
		pollInterval:   "",
		remoteID:       id,
		remoteProtocol: "email",
		userID:         id,
	})
	if err == nil {
		t.Error("expected AddSyncJobFor returned an error for empty pollInterval")
	}
	_, err = sch.AddSyncJobFor(cacheEntry{
		pollInterval:   "toto",
		remoteID:       id,
		remoteProtocol: "email",
		userID:         id,
	})
	if err == nil {
		t.Error("expected AddSyncJobFor returned an error for invalid pollInterval")
	}

	// test adding a valid entry
	entry, err := sch.AddSyncJobFor(cacheEntry{
		pollInterval:   "1",
		remoteID:       id,
		remoteProtocol: "email",
		userID:         id,
	})
	if err != nil {
		t.Error(err)
	}
	// test that entry has been updated with cronId
	if entry.cronId == 0 {
		t.Error("expected entry.cronId has been set, got 0")
	}

	// test that MainCron has a new job
	if len(sch.MainCron.Entries()) != 2 {
		t.Errorf("expected 2 jobs in MainCron, got %d", len(sch.MainCron.Entries()))
	}
	// test that next job from MainCron will be the syncjob just added
	// and that it'll run in less than a minute
	sch.MainCron.Start()
	syncJob := sch.MainCron.Entries()[0]
	if reflect.TypeOf(syncJob.Job.Run) != reflect.TypeOf(func() {}) {
		t.Errorf("expected AddPendingJob to be the job to run, got %s", reflect.TypeOf(syncJob.Job.Run))
	}
	dur := syncJob.Next.Sub(time.Now())
	if dur < 0 || dur > time.Minute {
		t.Errorf("expected job to be run within minute timeframe, got %d seconds", dur/time.Second)
	}
}

func TestScheduler_RemoveJobFor(t *testing.T) {
	poller.Config = PollerConfig{
		ScanInterval: 10,
	}
	sch, err := initScheduler()
	if err != nil {
		t.Error(err)
		return
	}
	// fill-in scheduler
	const count = 1000 // must be an even number
	entries := []cacheEntry{}
	for i := 0; i < count; i++ {
		id := objects.UUID(uuid.NewV4())
		entry, err := sch.AddSyncJobFor(cacheEntry{
			pollInterval:   "1",
			remoteID:       id,
			remoteProtocol: "email",
			userID:         id,
		})
		if err != nil {
			t.Error(err)
		}
		entries = append(entries, entry)
	}

	// sequentially remove half of jobs because cron pkg fails to handle concurrent remove
	// TODO : ^^^dig into this flaw^^^
	for i := 0; i < count/2; i++ {
		sch.RemoveJobFor(entries[i])
	}
	if len(sch.MainCron.Entries()) != (count/2)+1 {
		t.Errorf("expected %d jobs left in MainCron, got %d", (count/2)+1, len(sch.MainCron.Entries()))
	}
}

func TestScheduler_UpdateSyncJobFor(t *testing.T) {
	poller.Config = PollerConfig{
		ScanInterval: 10,
	}
	sch, err := initScheduler()
	if err != nil {
		t.Error(err)
		return
	}
	// fill-in scheduler
	const count = 1000 // must be an even number
	entries := []cacheEntry{}
	for i := 0; i < count; i++ {
		id := objects.UUID(uuid.NewV4())
		entry, err := sch.AddSyncJobFor(cacheEntry{
			pollInterval:   "1",
			remoteID:       id,
			remoteProtocol: "email",
			userID:         id,
		})
		if err != nil {
			t.Error(err)
		}
		entries = append(entries, entry)
	}

	// update pollinterval
	for i := 0; i < count; i++ {
		entry := entries[i]
		oldCronId := entry.cronId
		entry.pollInterval = strconv.Itoa(i)
		entry, err := sch.UpdateSyncJobFor(entry)
		if err != nil {
			t.Error(err)
		}
		if entry.cronId == oldCronId || entry.cronId == 0 {
			t.Error("expected a new cron id after updating entry")
		}
	}
}
