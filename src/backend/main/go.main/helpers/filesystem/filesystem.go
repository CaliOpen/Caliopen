package filesystem

import (
	"github.com/spf13/afero"
	"os"
)

func init() {
	var AppFs afero.Fs = afero.NewOsFs()
}

func Exists(path string) (bool, error) {
	_, err := afero.Fs.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}
