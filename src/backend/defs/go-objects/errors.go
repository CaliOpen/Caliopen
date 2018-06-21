/*
 * // Copyleft (ɔ) 2018 The Caliopen contributors.
 * // Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
 * // license (AGPL) that can be found in the LICENSE file.
 */

package objects

import (
	"errors"
	"fmt"
)

// implements standard Error interface as well as custom CaliopenError interface
type CaliopenErr struct {
	cause error
	code  int
	msg   string
}

type CaliopenError interface {
	Cause() error
	Code() int32
	Error() string
}

func (ce CaliopenErr) Error() string {
	return ce.msg
}

func (ce CaliopenErr) Code() int32 {
	return int32(ce.code)
}

func (ce CaliopenErr) Cause() error {
	return ce.cause
}
func NewCaliopenErr(code int, msg string) CaliopenErr {
	return CaliopenErr{errors.New("nil"), code, msg}
}

func NewCaliopenErrf(code int, format string, a ...interface{}) CaliopenErr {
	return CaliopenErr{
		cause: errors.New("nil"),
		code:  code,
		msg:   fmt.Sprintf(format, a...),
	}
}

func WrapCaliopenErrf(err error, code int, format string, a ...interface{}) CaliopenErr {
	e := CaliopenErr{
		code: code,
		msg:  fmt.Sprintf(format, a...),
	}
	if err != nil {
		e.cause = err
	} else {
		e.cause = errors.New("nil")
	}
	return e
}

func WrapCaliopenErr(err error, code int, msg string) CaliopenErr {
	e := CaliopenErr{
		code: code,
		msg:  msg,
	}
	if err != nil {
		e.cause = err
	} else {
		e.cause = errors.New("nil")
	}
	return e
}

// custom errors code
const (
	UnknownCaliopenErr = iota
	DbCaliopenErr
	IndexCaliopenErr
	NotFoundCaliopenErr
	FailDependencyCaliopenErr
	UnprocessableCaliopenErr
	ForbiddenCaliopenErr
	NotImplementedCaliopenErr
	WrongCredentialsErr
)
