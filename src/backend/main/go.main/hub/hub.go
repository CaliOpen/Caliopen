// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.
//
// hub package is a middleware to dispatch procedure calls
// to relevant application components
//
// HandlersTypes = []string{
//	"store",
//      "index",
//      "cache",
//      "func",
//      "nats",
// }

package hub

import (
	"fmt"
	"reflect"
)

type HandlerFunc interface{}
type Msg interface{}

type Hub struct {
	handlers map[string]HandlerFunc
}

var (
	runningHub *Hub
)

func init() {
	runningHub = new(Hub)
}

func (h *Hub) AddHandler(handler HandlerFunc) {
	handlerType := reflect.TypeOf(handler)
	queryTypeName := handlerType.In(0).Elem().Name()
	h.handlers[queryTypeName] = handler
}

func (h *Hub) Dispacth(msg Msg) error {
	var msgName = reflect.TypeOf(msg).Elem().Name()

	var handler = h.handlers[msgName]
	if handler == nil {
		return fmt.Errorf("handler not found for %s", msgName)
	}

	var params = make([]reflect.Value, 1)
	params[0] = reflect.ValueOf(msg)

	ret := reflect.ValueOf(handler).Call(params)
	err := ret[0].Interface()
	if err == nil {
		return nil
	} else {
		return err.(error)
	}
}

func Dispatch(msg Msg) error {
	return runningHub.Dispacth(msg)
}
