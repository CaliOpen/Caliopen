package caliopen


func (caliopen *CaliopenFacilities) UsernameIsAvailable(username string) (bool, error) {

        return (*caliopen.RESTstore).IsAvailable(username)
}