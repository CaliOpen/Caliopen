package go_remoteIDs

import (
	"github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/CaliOpen/Caliopen/src/backend/main/go.backends/backendstest"
	"sync"
	"testing"
	"time"
)

// initDbHandlerTest returns a DbHandler with a mock IdentityStorage interface
func initDbHandlerTest() (*DbHandler, error) {
	handler := new(DbHandler)
	handler.remoteProtocols = []string{"imap", "email", "twitter"}
	handler.Store = backendstest.GetIdentitiesInterface([]*objects.UserIdentity{}, []*objects.UserIdentity{})
	handler.cache = make(map[string]cacheEntry)
	handler.cacheMux = new(sync.Mutex)
	return handler, nil
}

func TestDbHandler_SyncCache(t *testing.T) {
	dbh, err := initDbHandlerTest()
	if err != nil {
		t.Fatal(err)
	}
	// test that all active remotes have been added to cache
	added, removed, updated, err := dbh.SyncCache()
	if err != nil {
		t.Error(err)
	}
	if len(added) != backendstest.ActiveRemotesCount() || len(dbh.cache) != backendstest.ActiveRemotesCount() {
		t.Errorf("not all active remotes where added to cache : expected %d, but added=%d and cache length is %d", backendstest.ActiveRemotesCount(), len(added), len(dbh.cache))
	}
	if len(removed) != 0 {
		t.Errorf("expected 0 for removed, had %d", len(removed))
	}
	if len(updated) != 0 {
		t.Errorf("expected 0 for updated, had %d", len(updated))
	}

	// test cache entries are well-formed
	for key, entry := range dbh.cache {
		if key != entry.userID.String()+entry.remoteID.String() {
			t.Errorf("key entry not equal to userID+remoteID : expected %s, got %s", entry.userID.String()+entry.remoteID.String(), key)
		}
		if entry.pollInterval == "" {
			t.Errorf("poll interval is empty, it should have been set to default")
		}
	}

	// sync again to check if nothing has changed into cache
	added, removed, updated, err = dbh.SyncCache()
	if err != nil {
		t.Error(err)
	}
	if len(added) != 0 || len(removed) != 0 || len(updated) != 0 {
		t.Errorf("expected empty arrays after resync, had : added=%d, removed=%d, updated=%d", len(added), len(removed), len(updated))
	}

	// modifications of cache below should trigger an add, an update and a delete after syncing again
	remotesTestSet, _ := dbh.Store.RetrieveAllRemotes(false)
	// remove one identity from cache, add an inactive one and update one
	var oneDelete bool
	var oneInactive bool
	var oneUpdate bool
	for remote := range remotesTestSet {
		if dbh.statusTypeOK(remote) {
			if !oneDelete {
				delete(dbh.cache, remote.UserId.String()+remote.Id.String())
				oneDelete = true
				continue
			}
			if !oneUpdate {
				idkey := remote.UserId.String() + remote.Id.String()
				if c, ok := dbh.cache[idkey]; ok {
					c.pollInterval = ""
					dbh.cache[idkey] = c
					oneUpdate = true
					continue
				} else {
					t.Errorf("failed to retrieve cache entry %s", idkey)
				}
			}
		}
		if remote.Status == "inactive" {
			idkey := remote.UserId.String() + remote.Id.String()
			dbh.cache[idkey] = cacheEntry{
				iDkey:          idkey,
				pollInterval:   defaultInterval,
				remoteID:       remote.Id,
				remoteProtocol: remote.Protocol,
				userID:         remote.UserId,
			}
			oneInactive = true
		}
		if oneDelete && oneInactive && oneUpdate {
			break
		}
	}
	// syncing again
	added, removed, updated, err = dbh.SyncCache()
	if len(added) != 1 {
		t.Errorf("expected one identity added, got %d", len(added))
	}
	if len(removed) != 1 {
		t.Errorf("expected one identity removed, got %d", len(added))
	}
	if len(updated) != 1 {
		t.Errorf("expected one identity updated, got %d", len(added))
	}
}

func TestDbHandler_GetCacheEntry(t *testing.T) {
	dbh, err := initDbHandlerTest()
	if err != nil {
		t.Fatal(err)
	}
	dbh.cache["key1"] = cacheEntry{}
	dbh.cache["key2"] = cacheEntry{}

	// test not found entry
	if _, ok := dbh.GetCacheEntry("unvalid"); ok {
		t.Error("GetCacheEntry return true, expected false")
	}

	// test concurrent access
	wg := new(sync.WaitGroup)
	c := make(chan struct{})
	wg.Add(2)
	go func() {
		wg.Wait()
		close(c)
	}()
	go func() {
		if _, ok := dbh.GetCacheEntry("key1"); !ok {
			t.Error("failed to retrieve cache entry 'key1'")
		}
		wg.Done()
	}()
	go func() {
		if _, ok := dbh.GetCacheEntry("key2"); !ok {
			t.Error("failed to retrieve cache entry 'key2'")
		}
		wg.Done()
	}()
	select {
	case <-c:
		return
	case <-time.After(time.Second):
		t.Error("timeout waiting for concurrent get")
	}
}

func TestDbHandler_UpdateCacheEntry(t *testing.T) {
	dbh, err := initDbHandlerTest()
	if err != nil {
		t.Fatal(err)
	}
	origin := cacheEntry{
		iDkey:        "key",
		pollInterval: "1",
	}
	dbh.cache["key"] = origin

	// test concurrent update
	wg := new(sync.WaitGroup)
	c := make(chan struct{})
	wg.Add(2)
	go func() {
		wg.Wait()
		close(c)
	}()
	go func() {
		mod1 := origin
		mod1.pollInterval = "2"
		dbh.UpdateCacheEntry(mod1)
		wg.Done()
	}()
	go func() {
		mod1 := origin
		mod1.pollInterval = "3"
		dbh.UpdateCacheEntry(mod1)
		wg.Done()
	}()
	select {
	case <-c:
		if entry, ok := dbh.GetCacheEntry("key"); ok {
			if entry.pollInterval != "2" && entry.pollInterval != "3" {
				t.Errorf("expected pollintervall to be '2' or '3', got %s", entry.pollInterval)
			}
		} else {
			t.Error("failed to get cache entry 'key' to test UpdateCacheEntry")
		}
	case <-time.After(time.Second):
		t.Error("timeout waiting for concurrent update")
	}
}

func TestDbHandler_RemoveCacheEntry(t *testing.T) {
	dbh, err := initDbHandlerTest()
	if err != nil {
		t.Fatal(err)
	}
	dbh.cache["key1"] = cacheEntry{}
	dbh.cache["key2"] = cacheEntry{}
	dbh.cache["key3"] = cacheEntry{}

	// test concurrent remove
	wg := new(sync.WaitGroup)
	c := make(chan struct{})
	wg.Add(2)
	go func() {
		wg.Wait()
		close(c)
	}()
	go func() {
		dbh.RemoveCacheEntry("key1")
		wg.Done()
	}()
	go func() {
		dbh.RemoveCacheEntry("key2")
		wg.Done()
	}()
	select {
	case <-c:
		if len(dbh.cache) != 1 {
			t.Errorf("expected cache with one entry, got %d", len(dbh.cache))
		}
	case <-time.After(time.Second):
		t.Error("timeout waiting for concurrent get")
	}
}
