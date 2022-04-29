package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "proyecto.com/fase2/Proto"
)

const (
	gRPC_IP_ENV   = "gRPC_SERVER_IP"
	gRPC_PORT_ENV = "gRPC_SERVER_PORT"
	API_PORT_ENV  = "API_GO_PORT"
)

var (
	serverAddr = flag.String("addr", fmt.Sprintf("%s:%s", getEnv(gRPC_IP_ENV, "localhost"), getEnv(gRPC_PORT_ENV, "50051")), "Server address in format host:port")
)

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}

func main() {
	fmt.Printf("API server running on port %s", getEnv(API_PORT_ENV, "5000"))
	app := fiber.New()
	app.Use(cors.New())
	app.Post("/runGame", startGameRoute)
	app.Get("/", apiTest)
	err := app.Listen(fmt.Sprintf(":%s", getEnv(API_PORT_ENV, "5000")))
	if err != nil {
		fmt.Println("Error starting fiber server", err)
		return
	}
}

func apiTest(c *fiber.Ctx) error {
	return c.Status(200).SendString("ok")
}

func startGameRoute(c *fiber.Ctx) error {
	var request pb.GameRequest
	json.Unmarshal(c.Body(), &request)
	result := startGame(request)

	if result != -1 {
		return c.Status(200).SendString("Game Registered")
	}

	return c.Status(400).SendString("Error calling remote method")
}

func startGame(gameRequest pb.GameRequest) int32 {
	fmt.Println("Calling remote method StartGame...")

	var opts []grpc.DialOption
	opts = append(opts, grpc.WithTransportCredentials(insecure.NewCredentials()))

	conn, err := grpc.Dial(*serverAddr, opts...)
	if err != nil {
		fmt.Println("Error dialing to server...")
		return -1
	}
	defer conn.Close()

	client := pb.NewLocalAPIClient(conn)

	result, err := client.StartGame(context.Background(), &gameRequest)

	if err != nil {
		fmt.Println("Error sending game request", err)
		return -1
	}

	fmt.Println("Method called success...")
	return result.Status
}
