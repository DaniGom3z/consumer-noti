import { connect } from "amqplib";
import axios from "axios";
async function consumeMessages() {
    try {
      const connection = await connect("amqp://52.205.27.36/");
      const channel = await connection.createChannel();
  
      const queue = "mqtt";
      const exchangeName = "amq.topic";
  
      await channel.assertQueue(queue, { durable: true });
      await channel.bindQueue(queue, exchangeName, "esp32.mqtt");
  
      console.log("Waiting for messages...");
  
      channel.consume(
        queue,
        async (message) => {
          try {
            const encierroContent = message.content.toString();
            const encierroData = JSON.parse(encierroContent);
  
            const {
              temperature,
              humidity,
              food,
              water,
              enclosureId,
              datoId,
              date
            } = encierroData;
  
            if (
              temperature &&
              humidity &&
              food &&
              water &&
              enclosureId &&
              datoId &&
              date
            ) {
              await createEnclonsure(temperature, humidity, food, water,enclosureId,datoId,date);
              console.log("Mensajes enviados");
              await channel.ack(message);
            } else {
              throw new Error("Datos de mensaje incorrectos");
            }
          } catch (error) {
            console.error("Error al procesar el mensaje:", error);
            await channel.nack(message, false, false);
          }
        },
        { noAck: false }
      );
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
    }
  }
  
  async function createEnclonsure(
    temperature,
    humidity,
    food,
    water,
    enclosureId,
    datoId,
    date
  ) {

    temperature = temperature || null;
    humidity = humidity || null;
    food = food || null;
    water = water || null;

    const dataToSend = {
      temperature: temperature,
      humidity: humidity,
      food: food,
      water: water,
      enclosureId:enclosureId,
      datoId:datoId,
      date:date
    };

    try {
      await axios.post("http://localhost:6000/api/notification", dataToSend);
    } catch (error) {
      console.error("Error al crear enclonsure:", error);
    }
}

  
  consumeMessages()
    .then(() => console.log("Consumer app started"))
    .catch((error) => console.error(error));
  