package users

import (
	"gopkg.in/gin-gonic/gin.v1"
	"net/http"
)

// POST …/users/
func Create(c *gin.Context) {
        c.AbortWithStatus(http.StatusNotImplemented)
	return
}

func Get(c *gin.Context) {
	c.AbortWithStatus(http.StatusNotImplemented)
	return
}
