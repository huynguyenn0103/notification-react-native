import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View ,Platform} from 'react-native';
import * as Notifications from 'expo-notifications'
import { useEffect, useRef, useState } from 'react';
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true
    }
  }
})
const allowsNotificationsAsync = async () => {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
};
 
const requestPermissionsAsync = async () => {
  return await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
};
export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();
  useEffect(() => {
    const fetchToken = async () => {
      const token = await Notifications.getExpoPushTokenAsync();
      console.log(token)// never change in our device
      if(Platform.OS === 'android'){
        Notifications.setNotificationChannelAsync('default',{
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT
        })
      }
    };
    fetchToken()
  }, []);
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) =>{// duoc thuc hien ngay khi notification come
      console.log(`Notification RECEIVED from ${notification.request.content.data.userName}`)// userName that we set above
      console.log(notification)
    })
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {// duoc thuc hien ngay khi tap vao notification
      console.log("Notification RESPONSE RECEIVED")
      console.log(response)
    })
    return () => {
      console.log("Call clean up function")
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  },[])
  const schduleNotificationHandler = async () => {
    const hasPushNotificationPermissionGranted = await allowsNotificationsAsync();
    if (!hasPushNotificationPermissionGranted) {
      await requestPermissionsAsync();
    }
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the body of the notification.",
        data: { userName: "Huy0103" },
      },
      trigger: {
        seconds: 5
      }
    });
  }

  //function that send pushNotification to another device
  const sendPushNotification = async () => {
    const result = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[sURrFqCKop36sfDdJ2IPKS]",
        sound: "default",
        title: "Original Title",
        body: "And here is the body!",
        data: { someData: "goes here" },
      }),
    });
    console.log(JSON.stringify(result))
  }
  return (
    <View style={styles.container}>
      <Button title='Schedule Notification' onPress={schduleNotificationHandler}/> 
      <Button title='Send Push Notification to my friends (in this demo is myself)' onPress={sendPushNotification}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
//expo install expo-notifications