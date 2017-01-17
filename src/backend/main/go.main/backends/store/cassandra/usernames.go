package store

// UserNameStorage interface
func (cb *CassandraBackend) IsAvailable (username string) (bool, error) {
	return false, nil
}
