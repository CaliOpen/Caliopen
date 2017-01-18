package main

import (
	"fmt"
	log "github.com/Sirupsen/logrus"
	"net/smtp"
	"sync"
	"time"
)

const (
	URL = "127.0.0.1:2525"
)

func lastWords(message string, err error) {
	fmt.Println(message, err.Error())
	return
	// panic(err)
}

// Sends 100 SMTP messages, for testing.
func main() {
	log.WithFields(log.Fields{"time": time.Now().Format(time.RFC3339Nano)}).Info("start sending mails")
	wg := sync.WaitGroup{}
	count := 100
	wg.Add(count)
	for i := 0; i < count; i++ {
		go sendMail(i, &wg)
	}
	wg.Wait()
	log.WithFields(log.Fields{"time": time.Now().Format(time.RFC3339Nano)}).Info("end sending mails")
}

func sendMail(i int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Printf("Sending mail #%d\n", i)
	c, err := smtp.Dial(URL)
	if err != nil {
		lastWords("Dial ", err)
	}
	defer c.Close()

	from := "stan@mailden.net"
	to := "dev@caliopen.local"
	to2 := "dev@caliopen.lal"

	if err = c.Mail(from); err != nil {
		lastWords("Mail ", err)
	}

	if err = c.Rcpt(to); err != nil {
		lastWords("Rcpt ", err)
	}

	if to2 != "" {
		if err = c.Rcpt(to2); err != nil {
			lastWords("Rcpt ", err)
		}
	}

	wr, err := c.Data()
	if err != nil {
		lastWords("Data ", err)
	}
	defer wr.Close()

	msg := fmt.Sprint("Subject: something\n")
	msg += "From: " + from + "\n"
	msg += "To: " + to + "\n"
	msg += "\n\n"
	msg += "hello\n"

	_, err = fmt.Fprint(wr, msg)
	if err != nil {
		lastWords("Send ", err)
	}

	err = c.Quit()
	if err != nil {
		lastWords("Quit ", err)
	}
	fmt.Printf("Finished sending mail #%d\n", i)
}
