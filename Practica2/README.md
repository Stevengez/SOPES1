# Practica 2 - Kubernetes

Esta practica consiste en la implementacion de diferentes modulos vistos en el proyecto 1 pero utilizando Kubernetes para su desplegue

Por motivos de simplicidad de la practica esta contiene parcialmente solo una ruta del proyecto anterior

Ya que el proyecto se creo usando contenedores la implementacion de la misma fue basicamente de estructurarla dentro del ambiente de Kubernetes, aun asi para mas detalle de la construccion y funcionamiento de los contenedores aqui usados por favor revisar la documentacion del proyecto fase 2 [aqui](https://github.com/MarcosC19/SO1-Proyecto-G19/tree/main/Fase2)

# Ruta

Esta ruta consiste en:

## LoadBalancer: 
Un servicio de kubernetes que permite equilibrar la carga entre diferentes replicas

para su implementacion se utiliza:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: load-balancer
spec:
  type: LoadBalancer
  selector:
    app: grpc
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5000
```

Donde el **targetPort** es el puerto donde escucha la API y **app** es la etiqueta que tienen los pods de la API cliente de grpc

## Deployment:
Un deployment quepermite escalar facilmente la estructura que contiene, que en este caso es un POD con el cliente y servidor de gRPC, puede ser desplegado con: 

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  labels:
    app: grpc
spec:
  replicas: 3
  selector:
    matchLabels:
      app: grpc
  template:
    metadata:
      labels:
        app: grpc
    spec:
      containers:
      - name: grpc-client
        image: stevengez/goclient_grpc
        ports:
        - containerPort: 5000
        env:
        - name: gRPC_SERVER_IP
          value: "localhost"
      
        - name: gRPC_SERVER_PORT
          value: "50051"
        
        - name: API_GO_PORT
          value: "5000"

      - name: grpc-server
        image: stevengez/nodeserver_grpc
        ports:
        - containerPort: 50051
        env:
        - name: gRPC_SERVER_PORT
          value: "50051"

        - name: RABBIT_SERVER
          value: "rabbit"

        - name: RABBIT_USER
          valueFrom:
            secretKeyRef: 
              name: rabbit-default-user
              key: username

        - name: RABBIT_PASSWORD
          valueFrom:
            secretKeyRef: 
              name: rabbit-default-user
              key: password

```

## RabbitMQ

El manejador de colas, permite distribuir mensajes de manera optima, para su implementacion se hace uso del operador de rabbitmq que hace su implementacion verdaderamente facil

Para su despliegue hace falta primero instalar el operador con el siguiente comando: 

```bash
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
```

Una vez instalado hace falta desplegar el cluster de RabbitMQ con:

```yaml
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: rabbit
spec:
  replicas: 1
  resources:
    requests:
      cpu: 800m
      memory: 1Gi
    limits: 
      cpu: 1000m
      memory: 2Gi

```

## Rabbit Subscriber

Para poder recibir los mensajes del administrador de la cola y posteriormente ingresarlos a la DB hace falta un subscriber (en go), este se ejecuta en un pod ya que ningun otro elemento accede a el y solo se comunica con la DB

Para su despliegue se realiza con: 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: subscriber
spec:
  restartPolicy: Never

  containers:
    - name: subscriber
      image: stevengez/gorabbit_subscriber
      env:
      - name: RABIT_HOST 
        value: "rabbit"
      
      - name: RABBIT_QUEUE 
        value: "GameQueue"
      
      - name: RABBIT_USER 
        valueFrom:
          secretKeyRef: 
            name: rabbit-default-user
            key: username
        
      - name: RABBIT_PASSWORD 
        valueFrom:
          secretKeyRef: 
            name: rabbit-default-user
            key: password

      - name: MONGO_HOST 
        value: "10.128.0.13"

      - name: MONGO_USER 
        value: "admingrupo19"

      - name: MONGO_PASS 
        value: "so1-fase2"

      - name: MONGO_DB
        value: "so-proyecto-f2"
      
      - name: MONGO_COLLECTION
        value: "logs"

```

## MongoDB

Finamente la base de datos se encuentra externa al ambiente de kubernetes en una maquina virtual, dado que esto no es nuevo para el fin del proyecto y ha sido ampliamente visto antes no agregare mas informacion sobre su implementacion pero pueden hacerlo revisando la documentacion de la fase anterior.

