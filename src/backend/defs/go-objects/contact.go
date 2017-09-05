package objects

import (
	"github.com/gocql/gocql"
	"time"
)

type (
	Contact struct {
		AdditionalName  string            `cql:"additional_name"    json:"additional_name"`
		Addresses       []PostalAddress   `cql:"addresses"          json:"addresses"`
		Avatar          string            `cql:"avatar"             json:"avatar"`
		ContactId       UUID              `cql:"contact_id"         json:"contact_id"`
		DateInsert      time.Time         `cql:"date_insert"        json:"date_insert"`
		DateUpdate      time.Time         `cql:"date_update"        json:"date_update"`
		Deleted         bool              `cql:"deleted"            json:"deleted"`
		Emails          []EmailContact    `cql:"emails"             json:"emails"`
		FamilyName      string            `cql:"family_name"        json:"family_name"`
		GivenName       string            `cql:"given_name"         json:"given_name"`
		Groups          []string          `cql:"groups"             json:"groups"`
		Identities      []SocialIdentity  `cql:"identities"         json:"identities"`
		Ims             []IM              `cql:"ims"                json:"ims"`
		Infos           map[string]string `cql:"infos"              json:"infos"`
		NamePrefix      string            `cql:"name_prefix"        json:"name_prefix"`
		NameSuffix      string            `cql:"name_suffix"        json:"name_suffix"`
		Organizations   []Organization    `cql:"organizations"      json:"organizations"`
		Phones          []Phone           `cql:"phones"             json:"phones"`
		PrivacyIndex    *PrivacyIndex     `cql:"pi"                 json:"pi"`
		PrivacyFeatures *PrivacyFeatures  `cql:"privacy_features"   json:"privacy_features"`
		Tags            []Tag             `cql:"tags"               json:"tags"`
		Title           string            `cql:"title"              json:"title"`
		UserId          UUID              `cql:"user_id"            json:"user_id"`
	}
)

// unmarshal a map[string]interface{} that must owns all Contact's fields
// typical usage is for unmarshaling response from Cassandra backend
func (contact *Contact) UnmarshalCQLMap(input map[string]interface{}) {
	contact.AdditionalName, _ = input["additional_name"].(string)
	for _, address := range input["addresses"].([]map[string]interface{}) {
		pa := PostalAddress{}
		addressId, _ := address["address_id"].(gocql.UUID)
		pa.AddressId.UnmarshalBinary(addressId.Bytes())
		pa.City, _ = address["city"].(string)
		pa.Country, _ = address["country"].(string)
		pa.IsPrimary, _ = address["is_primary"].(bool)
		pa.Label, _ = address["label"].(string)
		pa.PostalCode, _ = address["postal_code"].(string)
		pa.Region, _ = address["region"].(string)
		pa.Street, _ = address["street"].(string)
		pa.Type, _ = address["type"].(string)
		contact.Addresses = append(contact.Addresses, pa)
	}
	contact.Avatar, _ = input["avatar"].(string)
	contactId, _ := input["contact_id"].(gocql.UUID)
	contact.ContactId.UnmarshalBinary(contactId.Bytes())
	contact.DateInsert, _ = input["date_insert"].(time.Time)
	contact.DateUpdate, _ = input["date_update"].(time.Time)
	contact.Deleted, _ = input["deleted"].(bool)
	for _, email := range input["emails"].([]map[string]interface{}) {
		e := EmailContact{}
		e.Address, _ = email["address"].(string)
		emailId, _ := email["email_id"].(gocql.UUID)
		e.EmailId.UnmarshalBinary(emailId.Bytes())
		e.IsPrimary, _ = email["is_primary"].(bool)
		e.Label, _ = email["label"].(string)
		e.Type, _ = email["type"].(string)
		contact.Emails = append(contact.Emails, e)
	}
	contact.FamilyName, _ = input["family_name"].(string)
	contact.GivenName, _ = input["given_name"].(string)
	contact.Groups, _ = input["groups"].([]string)
	for _, identity := range input["identities"].([]map[string]interface{}) {
		i := SocialIdentity{}
		i.Infos, _ = identity["infos"].(map[string]string)
		i.Name, _ = identity["name"].(string)
		socialId, _ := identity["social_id"].(gocql.UUID)
		i.SocialId.UnmarshalBinary(socialId.Bytes())
		i.Type, _ = identity["type"].(string)
		contact.Identities = append(contact.Identities, i)
	}
	for _, im := range input["ims"].([]map[string]interface{}) {
		i_m := IM{}
		i_m.Address, _ = im["address"].(string)
		imid, _ := im["im_id"].(gocql.UUID)
		i_m.IMId.UnmarshalBinary(imid.Bytes())
		i_m.IsPrimary, _ = im["is_primary"].(bool)
		i_m.Label, _ = im["label"].(string)
		i_m.Protocol, _ = im["protocol"].(string)
		i_m.Type, _ = im["type"].(string)
		contact.Ims = append(contact.Ims, i_m)
	}
	contact.Infos, _ = input["infos"].(map[string]string)
	contact.NamePrefix, _ = input["name_prefix"].(string)
	contact.NameSuffix, _ = input["name_suffix"].(string)
	for _, org := range input["organizations"].([]map[string]interface{}) {
		o := Organization{}
		o.Deleted, _ = org["deleted"].(bool)
		o.Department, _ = org["department"].(string)
		o.IsPrimary, _ = org["is_primary"].(bool)
		o.JobDescription, _ = org["job_description"].(string)
		o.Label, _ = org["label"].(string)
		o.Name, _ = org["name"].(string)
		orgId, _ := org["organization_id"].(gocql.UUID)
		o.OrganizationId.UnmarshalBinary(orgId.Bytes())
		o.Title, _ = org["title"].(string)
		o.Type, _ = org["type"].(string)
		contact.Organizations = append(contact.Organizations, o)
	}
	for _, phone := range input["phones"].([]map[string]interface{}) {
		p := Phone{}
		p.IsPrimary, _ = phone["is_primary"].(bool)
		p.Number, _ = phone["number"].(string)
		phoneId, _ := phone["phone_id"].(gocql.UUID)
		p.PhoneId.UnmarshalBinary(phoneId.Bytes())
		p.Type, _ = phone["type"].(string)
		p.Uri, _ = phone["uri"].(string)
		contact.Phones = append(contact.Phones, p)
	}
	if input["pi"] != nil {
		i_pi, _ := input["pi"].(map[string]interface{})
		pi := PrivacyIndex{}
		pi.Comportment, _ = i_pi["comportment"].(int)
		pi.Context, _ = i_pi["context"].(int)
		pi.DateUpdate, _ = i_pi["date_update"].(time.Time)
		pi.Technic, _ = i_pi["technic"].(int)
		pi.Version, _ = i_pi["version"].(int)
		contact.PrivacyIndex = &pi
	} else {
		contact.PrivacyIndex = nil
	}
	if input["privacy_features"] != nil {
		i_pf, _ := input["privacy_features"].(map[string]string)
		pf := PrivacyFeatures{}
		for k, v := range i_pf {
			pf[k] = v
		}
		contact.PrivacyFeatures = &pf

	} else {
		contact.PrivacyFeatures = nil
	}
	for _, tag := range input["tags"].([]map[string]interface{}) {
		t := Tag{}
		t.Date_insert, _ = tag["date_insert"].(time.Time)
		il, _ := tag["importance_level"].(int)
		t.Importance_level = int32(il)
		t.Name, _ = tag["name"].(string)
		tagid, _ := tag["tag_id"].(gocql.UUID)
		t.Tag_id.UnmarshalBinary(tagid.Bytes())
		tagtype, _ := tag["type"].(string)
		t.Type = TagType(tagtype)
	}
	contact.Title, _ = input["title"].(string)
	userid, _ := input["user_id"].(gocql.UUID)
	contact.UserId.UnmarshalBinary(userid.Bytes())
}
