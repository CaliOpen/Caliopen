package operations

import (
	"gopkg.in/gin-gonic/gin.v1"
	"strconv"
	"strings"
)

// fall back to default values if can't extract valid numbers.
func GetImportanceLevel(ctx *gin.Context) (il [2]int8) {
	il = [2]int8{-10, 10} // default values
	var from, to int
	var err error
	if il_header, ok := ctx.Request.Header["X-Caliopen-Il"]; !ok {
		return il
	} else {
		il_range_str := strings.Split(il_header[0], ";") // get only first value found
		if len(il_range_str) != 2 {
			return il
		}
		from, err = strconv.Atoi(il_range_str[0])
		if err != nil {
			from = -10
		}
		to, err = strconv.Atoi(il_range_str[1])
		if err != nil {
			to = 10
		}
		if from < -10 || from > 10 {
			from = -10
		}
		if to < -10 || to > 10 {
			to = 10
		}
		if from > to {
			from = to
		}
		il[0] = int8(from)
		il[1] = int8(to)
		return
	}
}
