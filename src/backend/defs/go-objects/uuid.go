package objects

import (
	"encoding/hex"
	"fmt"
	"github.com/gocql/gocql"
)

type UUID [16]byte

// Used in string method conversion
const dash byte = '-'

func (id UUID) MarshalCQL(info gocql.TypeInfo) ([]byte, error) {
	return id[:], nil
}

func (id *UUID) UnmarshalCQL(info gocql.TypeInfo, data []byte) error {
	if len(data) != 16 {
		return fmt.Errorf("uuid: UUID must be exactly 16 bytes long, got %d bytes", len(data))
	}
	return id.UnmarshalBinary(data)
}

// UnmarshalBinary implements the encoding.BinaryUnmarshaler interface.
// It will return error if the slice isn't 16 bytes long.
func (id *UUID) UnmarshalBinary(data []byte) (err error) {
	if len(data) != 16 {
		err = fmt.Errorf("uuid: UUID must be exactly 16 bytes long, got %d bytes", len(data))
		return
	}
	copy(id[:], data)

	return
}

// Returns canonical string representation of UUID:
// xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.
func (id UUID) String() string {
	buf := make([]byte, 36)

	hex.Encode(buf[0:8], id[0:4])
	buf[8] = dash
	hex.Encode(buf[9:13], id[4:6])
	buf[13] = dash
	hex.Encode(buf[14:18], id[6:8])
	buf[18] = dash
	hex.Encode(buf[19:23], id[8:10])
	buf[23] = dash
	hex.Encode(buf[24:], id[10:])

	return string(buf)
}

func (id UUID) MarshalJSON() ([]byte, error) {
	return []byte("\"" + id.String() + "\""), nil
}

// Bytes returns the raw byte slice for this UUID. A UUID is always 128 bits
// (16 bytes) long.
func (id UUID) Bytes() []byte {
	return id[:]
}
