package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo/readpref"

	"github.com/go-redis/redis/v8"
	_ "github.com/go-sql-driver/mysql"
	"github.com/streadway/amqp"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	RABBIT_SERVER_ENV    = "RABIT_HOST"
	RABBIT_PORT_ENV      = "RABBIT_PORT"
	RABBIT_QUEUE_ENV     = "RABBIT_QUEUE"
	RABBIT_USER_ENV      = "RABBIT_USER"
	RABBIT_PASS_ENV      = "RABBIT_PASSWORD"
	REDIS_HOST_ENV       = "REDIS_HOST"
	REDIS_PORT_ENV       = "REDIS_PORT"
	MONGO_HOST_ENV       = "MONGO_HOST"
	MONGO_PORT_ENV       = "MONGO_PORT"
	MONGO_USER_ENV       = "MONGO_USER"
	MONGO_PASS_ENV       = "MONGO_PASS"
	MONGO_DB_ENV         = "MONGO_DB"
	MONGO_COLLECTION_ENV = "MONGO_COLLECTION"
	TIDB_HOST_ENV        = "TiDB_HOST"
	TIDB_USER_ENV        = "TiDB_USER"
	TIDB_PASS_ENV        = "TiDB_PORT"
	TIDB_DB_ENV          = "TiDB_DB"
)

var (
	RabbitHost      = getEnv(RABBIT_SERVER_ENV, "localhost")
	RabbitPort      = getEnv(RABBIT_PORT_ENV, "5672")
	RabbitQueue     = getEnv(RABBIT_QUEUE_ENV, "GameQueue")
	RabbitUser      = getEnv(RABBIT_USER_ENV, "rabbit")
	RabbitPass      = getEnv(RABBIT_PASS_ENV, "sopes1")
	RedisHost       = getEnv(REDIS_HOST_ENV, "10.128.0.21")
	RedisPort       = getEnv(REDIS_PORT_ENV, "6379")
	MongoHost       = getEnv(MONGO_HOST_ENV, "10.128.0.20")
	MongoPort       = getEnv(MONGO_PORT_ENV, "27017")
	MongoUser       = getEnv(MONGO_USER_ENV, "mongoadminG19")
	MongoPass       = getEnv(MONGO_PASS_ENV, "proyectof1g19")
	MongoDB         = getEnv(MONGO_DB_ENV, "so-proyecto-f2")
	MongoCollection = getEnv(MONGO_COLLECTION_ENV, "logs")
	TiDBHost        = getEnv(TIDB_HOST_ENV, "34.68.145.193")
	TiDBUser        = getEnv(TIDB_USER_ENV, "grupo19")
	TiDBPass        = getEnv(TIDB_PASS_ENV, "grupo19-f2")
	TiDBDB          = getEnv(TIDB_DB_ENV, "sopes1f2")
)

type Log struct {
	Game_id   int32  `json:"game_id"`
	Players   int32  `json:"players_num"`
	Game_name string `json:"game_name"`
	Winner    int32  `json:"winner"`
	Queue     string `json:"queue"`
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}

func main() {
	// Wait for Rabbit to Start Delay
	time.Sleep(15 * time.Second)

	// Start the RabbitMQ connection using credentials
	conn, err := amqp.Dial(fmt.Sprintf("amqp://%s:%s@%s", RabbitUser, RabbitPass, RabbitHost))

	if err != nil {
		fmt.Println("Error connecting to Rabbit", err)
		return
	}
	defer conn.Close()

	// Create the Channel
	ch, err := conn.Channel()
	if err != nil {
		fmt.Println("Error creating the channel", err)
		return
	}
	defer ch.Close()

	messages, err := ch.Consume(
		RabbitQueue,
		"",
		true,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		fmt.Printf("Error subscribing to %s queue, error: %s \n", RabbitQueue, err)
		return
	}

	fmt.Println("Connection succeed to RabbitMQ")
	fmt.Println("Waiting for messages...")

	go listenMessages(messages)
	select {}
}

func listenMessages(messages <-chan amqp.Delivery) {
	for message := range messages {
		var log Log
		fmt.Println("Raw Message: ", string(message.Body))
		err := json.Unmarshal(message.Body, &log)
		if err != nil {
			fmt.Println("Error marshalling", err)
			return
		}

		fmt.Println("##########################")
		fmt.Println("# New Message: ")
		fmt.Printf("# GameID: %d\n", log.Game_id)
		fmt.Printf("# Players: %d\n", log.Players)
		fmt.Printf("# GameName: %s\n", log.Game_name)
		fmt.Printf("# Winner: %d\n", log.Winner)
		fmt.Printf("# Queue: %s\n", log.Queue)
		fmt.Println("##########################")

		go saveToRedis(string(message.Body))
		go saveToMongo(log)
		go saveToTiDB(log)
	}
}
func saveToMongo(data Log) {
	client, err := mongo.Connect(
		context.Background(),
		options.Client().ApplyURI("mongodb://"+MongoUser+":"+MongoPass+"@"+MongoHost+":"+MongoPort),
	)

	if err != nil {
		fmt.Println("Error connecting to MongoDB: ", err)
		return
	}
	defer client.Disconnect(context.Background())

	err = client.Ping(context.Background(), readpref.Primary())

	if err != nil {
		fmt.Println("Error pinging connection with MongoDB: ", err)
		return
	}

	Collection := client.Database(MongoDB).Collection(MongoCollection)

	insertResult, err := Collection.InsertOne(context.Background(), data)

	if err != nil {
		fmt.Println("Error inserting data: ", err)
	}

	fmt.Println("Nuevo log insertado en Mongo: ", insertResult)
}

func saveToRedis(data string) {
	rdb := redis.NewClient(&redis.Options{
		Addr:        fmt.Sprintf("%s:%s", RedisHost, RedisPort),
		Password:    "",
		DB:          0,
		DialTimeout: 3 * time.Second,
		ReadTimeout: 3 * time.Second,
		MaxRetries:  -1,
	})

	_, err := rdb.Ping(context.Background()).Result()

	if err != nil {
		fmt.Println("Connection to redis failed (timeout?)")
		return
	}

	val, err := rdb.Do(context.Background(), "keys", "*").StringSlice()

	if err != nil {
		fmt.Println("Error with redis setup: ", err)
		return
	}

	cont := len(val)
	keyname := fmt.Sprint("result", cont)

	err = rdb.Set(context.Background(), keyname, data, 0).Err()

	if err != nil {
		fmt.Println("Error inserting data: ", err)
		return
	}

	fmt.Println("Nuevo log insertado en Redis:", keyname)
}

func saveToTiDB(logsData Log) {
	db, err := sql.Open("mysql", TiDBUser+":"+TiDBPass+"@tcp("+TiDBHost+":4000)/"+TiDBDB+"?timeout=3s")

	if err != nil {
		fmt.Println("Error connecting to TiDB: ", err)
		return
	}

	defer db.Close()

	insert, err := db.Prepare("INSERT INTO fase2(game_id, players, game_name, winner, queue) VALUES(?, ?, ?, ?, ?)")

	if err != nil {
		fmt.Println("Error preparing the DB insert: ", err)
		return
	}

	insert.Exec(int(logsData.Game_id), int(logsData.Players), logsData.Game_name, int(logsData.Winner), logsData.Queue)
	fmt.Println("Nuevo log insertado en TiDB...")
	defer insert.Close()
}
