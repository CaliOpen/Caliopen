package users

import (
	obj "github.com/CaliOpen/CaliOpen/src/backend/defs/go-objects"
	"github.com/CaliOpen/CaliOpen/src/backend/main/go.backends"
	"gopkg.in/gin-gonic/gin.v1"
	"net/http"
)

// GET …/users/isAvailable
func IsAvailable(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
                //TODO: validate against swagger
		c.JSON(http.StatusBadRequest, obj.Availability{false, username})
		return
	}

	backend := c.MustGet("APIStore").(*backends.APIStorage)
	available, err := (*backend).IsAvailable(username)

	if available && err == nil {
                //TODO: validate against swagger
		c.JSON(http.StatusOK, obj.Availability{true, username})
		return
	}
        //TODO: validate against swagger
	c.JSON(http.StatusOK, obj.Availability{false, username})
}
