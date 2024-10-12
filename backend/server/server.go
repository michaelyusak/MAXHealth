package server

import (
	"context"
	"max-health/config"
	"max-health/util"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"
)

func Init() {
	log := util.NewLogger()

	config := config.Init(log)

	router := createRouter(log, config)

	srv := http.Server{
		Handler: router,
		Addr:    config.Port,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 10)

	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit
	log.Info("Shutdown Server ...")

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(config.GracefulPeriod)*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown: %s", err.Error())
	}

	<-ctx.Done()

	log.Infof("Timeout of " + strconv.Itoa(config.GracefulPeriod) + " seconds")
	log.Info("Server exiting")
}
