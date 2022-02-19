package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/cors"
	"github.com/gofiber/fiber"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var MONGO_USER = getEnv("MONGO_USER", "userp1")
var MONGO_PASS = getEnv("MONGO_PASS", "userp1password")
var MONGO_HOST = getEnv("MONGO_HOST", "192.168.1.12")
var MONGO_PORT = getEnv("MONGO_PORT", "27017")

const MONGO_DB = "SO_Practica1"
const MONGO_COLLETION_NAME = "operations"

type Operation struct {
	Left      float64   `json:left,omitempty`
	Right     float64   `json:right,omitempty`
	Operator  string    `json:operator,omitempty`
	Timestamp time.Time `json:timestamp,omitempty`
}

func main() {
	fmt.Println("GoBackEnd Running in port: ", 5000)
	app := fiber.New()
	app.Use(cors.New())
	app.Get("/getRecords/", getRecords)
	app.Post("/addOperation/", addOperation)
	app.Listen(5000)
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}

func getRecords(c *fiber.Ctx) {
	collection, err := getCollection(MONGO_DB, MONGO_COLLETION_NAME)

	if err != nil {
		fmt.Println("Error connecting DB")
		c.Status(300).Send(err)
		return
	}

	var results []bson.M
	cur, err := collection.Find(context.Background(), bson.D{})
	defer cur.Close(context.Background())

	if err != nil {
		fmt.Println("No records found")
		c.Status(300).Send(err)
		return
	}

	cur.All(context.Background(), &results)

	if results == nil {
		fmt.Println("No records")
		c.Status(300).Send("Error filling results")
		return
	}

	json, _ := json.MarshalIndent(results, "", "	")
	c.Send(json)
}

func addOperation(c *fiber.Ctx) {
	collection, err := getCollection(MONGO_DB, MONGO_COLLETION_NAME)

	if err != nil {
		c.Status(300).Send(err)
		return
	}

	var operation Operation
	json.Unmarshal([]byte(c.Body()), &operation)
	operation.Timestamp = time.Now()

	fmt.Println("## Inserting New Operation")
	fmt.Println("# ", operation.Left, operation.Operator, operation.Right)

	res, err := collection.InsertOne(context.Background(), operation)
	if err != nil {
		c.Status(300).Send(err)
		return
	}

	response, _ := json.Marshal(res)
	c.Send(response)
}

func getDBConnector() (*mongo.Client, error) {

	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://"+MONGO_USER+":"+MONGO_PASS+"@"+MONGO_HOST+":"+MONGO_PORT+"/SO_Practica1?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false"))

	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(context.Background(), readpref.Primary())
	if err != nil {
		log.Fatal(err)
	}

	return client, nil
}

func getCollection(db string, collection string) (*mongo.Collection, error) {
	client, err := getDBConnector()

	if err != nil {
		return nil, err
	}

	Op_collection := client.Database(db).Collection(collection)
	return Op_collection, nil
}
