// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package store

import (
	"crypto/sha256"
	"fmt"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	log "github.com/Sirupsen/logrus"
	"github.com/gocassa/gocassa"
	"github.com/gocql/gocql"
	"sort"
	"strings"
)

// setParticipantLookupWithContact manage contact_ids related to a participant
func (cb *CassandraBackend) setParticipantLookupWithContact(user_id UUID, participant Participant, partId UUID) error {
	for _, uuid := range participant.Contact_ids {
		contact_id := uuid.String()
		log.Info("Processing participant ", participant, " with contact ", contact_id)
		lookup_contact, err := cb.RetrieveParticipantLookup(user_id, contact_id, "contact")
		if err == gocql.ErrNotFound {
			newLookup := &ParticipantLookup{}
			newLookup.MarshallNew(user_id)
			newLookup.Type = "contact"
			newLookup.Identifier = contact_id
			newLookup.ParticipantId = partId
			err = cb.CreateParticipantLookup(newLookup)
			if err != nil {
				return err
			}
			log.Info("Created contact related participant_lookup ", newLookup)
			return nil
		}
		if err != nil && err != gocql.ErrNotFound {
			return err
		}
		if lookup_contact.ParticipantId != partId {
			log.Warn("Inconsistent ParticipantId with contact one ", participant)
		}
	}
	return nil
}

func (cb *CassandraBackend) setParticipantLookup(user_id UUID, participant Participant) (partId UUID, err error) {
	lookup, err := cb.RetrieveParticipantLookup(user_id, participant.Address, participant.Protocol)
	if err == gocql.ErrNotFound {
		newLookup := &ParticipantLookup{}
		newLookup.MarshallNew(user_id)
		newLookup.Identifier = strings.ToLower(participant.Address)
		newLookup.Type = participant.Protocol
		err = cb.CreateParticipantLookup(newLookup)
		return newLookup.ParticipantId, err
	}
	return lookup.ParticipantId, err
}

func (cb *CassandraBackend) prepareParticipantLookup(user_id UUID, participants []Participant) (parts []string, err error) {
	set := make(map[string]struct{})
	parts = make([]string, len(participants))

	for _, participant := range participants {
		partId, err := cb.setParticipantLookup(user_id, participant)
		if err != nil {
			return parts, err
		}
		log.Info("Created participant ", partId, " for participant ", participant)

		err = cb.setParticipantLookupWithContact(user_id, participant, partId)
		if err != nil {
			return parts, err
		}
		to_add := partId.String()
		if _, ok := set[to_add]; !ok {
			set[to_add] = struct{}{}
			parts = append(parts, to_add)
		}
	}
	sort.Strings(parts)
	return parts, nil
}

// CreateDiscussion create a new discussion
func (cb *CassandraBackend) CreateDiscussion(discussion Discussion) error {
	discussionT := cb.IKeyspace.Table("discussion", &Discussion{}, gocassa.Keys{
		PartitionKeys: []string{"user_id", "discussion_id"},
	}).WithOptions(gocassa.Options{TableName: "discussion"})

	// save discussion
	err := discussionT.Set(discussion).Run()
	if err != nil {
		return fmt.Errorf("[CassandraBackend] CreateDiscussion: %s", err)
	}
	return nil
}

func (cb *CassandraBackend) GetDiscussion(user_id, discussion_id UUID) (discussion *Discussion, err error) {
	discussion = new(Discussion)
	m := map[string]interface{}{}
	q := cb.SessionQuery(`SELECT * FROM discussion WHERE user_id = ? AND discussion_id = ?`, user_id, discussion_id)
	err = q.MapScan(m)
	if err != nil {
		return nil, err
	}
	discussion.UnmarshalCQLMap(m)
	return
}

// CreateThreadLookup inserts a new entry into discussion_thread_lookup table
func (cb *CassandraBackend) CreateThreadLookup(user_id, discussion_id UUID, external_msg_id string) error {
	return cb.SessionQuery(`INSERT INTO discussion_thread_lookup (user_id, external_root_msg_id, discussion_id) VALUES (?,?,?)`,
		user_id.String(),
		external_msg_id,
		discussion_id.String()).Exec()
}

func (cb *CassandraBackend) CreateDiscussionGlobalLookup(user_id UUID, hash string, discussion_id UUID) error {
	return cb.SessionQuery(`INSERT INTO discussion_global_lookup (user_id, hashed, discussion_id) VALUES (?,?,?)`,
		user_id.String(),
		hash,
		discussion_id.String()).Exec()
}

func (cb *CassandraBackend) GetDiscussionGlobalLookup(user_id UUID, hash string) (lookup *DiscussionGlobalLookup, err error) {
	lookup = new(DiscussionGlobalLookup)
	m := map[string]interface{}{}
	q := cb.SessionQuery(`SELECT * FROM discussion_global_lookup WHERE user_id = ? AND hashed = ?`, user_id, hash)
	err = q.MapScan(m)
	if err != nil {
		return nil, err
	}
	lookup.UnmarshalCQLMap(m)
	return
}

// GetDiscussionByParticipants retrieve the hash value related to a list of participants used for discussion lookup
// golang version of python NewMessage.hash_participants function
func (cb *CassandraBackend) GetDiscussionHashByParticipants(user_id UUID, participants []Participant) (string, error) {
	parts, err := cb.prepareParticipantLookup(user_id, participants)
	if err != nil {
		log.Errorf("prepareParticipantLookup error %s", err)
		return "", err
	}
	hash := sha256.Sum256([]byte(strings.Join(parts, "")))
	log.Debug("Computed hash for partipants ", fmt.Sprintf("%x", hash))
	return fmt.Sprintf("%x", hash), nil
}

// GetOrCreateDiscussion will get an existing discussion for the list of given participants or create a new one
func (cb *CassandraBackend) GetOrCreateDiscussion(user_id UUID, participants []Participant) (discussion *Discussion, err error) {
	discussion = new(Discussion)
	hash, err := cb.GetDiscussionHashByParticipants(user_id, participants)
	if err != nil {
		return
	}
	lookup, err := cb.GetDiscussionGlobalLookup(user_id, hash)
	if err != nil && err != gocql.ErrNotFound {
		return
	}
	if lookup != nil {
		discussion, err = cb.GetDiscussion(user_id, lookup.DiscussionId)
		if err == nil {
			log.Debug("Found existing discussion ", discussion.Discussion_id)
		}
		return
	} else {
		discussion.MarshallNew(user_id)
		err = cb.CreateDiscussion(*discussion)
		if err != nil {
			return
		}
		err = cb.CreateDiscussionGlobalLookup(user_id, hash, discussion.Discussion_id)
		if err != nil {
			return
		}
		log.Debug("Create a new discussion ", discussion.Discussion_id)

	}
	return
}
