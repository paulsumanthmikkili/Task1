import amqp from 'amqplib';

interface UserData {
    name: string;
    email: string;
    username: string;
    password: string;
    userType:string
}


export const micro = async (): Promise<UserData> => {
    // Keep your existing connection and channel code.
        console.log("called")
   const connection=await amqp.connect('amqp://localhost');
    const channel=await connection.createChannel();
    const Queueuname="Resgister_Queueu";

    // Inside your Promise:
    const data = await new Promise<UserData>((resolve, reject) => {
        channel.consume(Queueuname, (message) => {
            if (message !== null) {
                const userData: UserData = JSON.parse(
                    message.content.toString("utf-8")
                );-

                channel.ack(message);
                resolve(userData);
            }
        }).catch(reject);
    });

    return data;
};

