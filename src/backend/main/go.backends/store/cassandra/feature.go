// Copyleft (ɔ) 2019 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package store

import (
	"errors"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
)

// RetrievePrivacyFeatures method return all store privacy feature definition
func (cb *CassandraBackend) RetrievePrivacyFeatures() (features []PrivacyFeature, err error) {
	all_feats, err := cb.SessionQuery(`SELECT * FROM privacy_feature`).Iter().SliceMap()
	if err != nil {
		return
	}
	if len(all_feats) == 0 {
		err = errors.New("Features not found")
		return
	}
	for _, feat := range all_feats {
		f := new(PrivacyFeature)
		f.UnmarshalCQLMap(feat)
		features = append(features, *f)
	}
	return
}
