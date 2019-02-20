package backends

import (
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

type ParticipantStorage interface {
	RetrieveParticipantLookup(user_id UUID, identifier, typ string) (*ParticipantLookup, error)
	CreateParticipantLookup(participant *ParticipantLookup) error
}
