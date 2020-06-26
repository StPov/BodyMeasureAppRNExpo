import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Button, TextInput, Alert, ScrollView, SafeAreaView, StatusBar } from "react-native";
import RadioButton from "./RadioButton";
import ImageButton from "./ImageButton";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

export default function App() {
  const [gender, setGender] = useState("male");
  const [femaleCheck, setFemaleCheck] = useState(false);
  const [maleCheck, setMaleCheck] = useState(true);
  const [weight, setWeight] = useState(0);
  const [height, setHeight] = useState(0);
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [sidePhoto, setSidePhoto] = useState(null);
  const [frontPhotoBase64, setFrontPhotoBase64] = useState('');
  const [sidePhotoBase64, setSidePhotoBase64] = useState('');
  const [frontPhotoSelected, setFrontPhotoSelected] = useState(false);
  const [sidePhotoSelected, setSidePhotoSelected] = useState(false);
  const [taskSetUrl, setTaskSetUrl] = useState('');
  const [userUrl, setUserUrl] = useState('');
  

  useEffect(() => {
    (async () => {
      if (Constants.platform.ios) {
        const {
          status,
        } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const selectPhoto = async (index) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      aspect: [1,2], //for ios always square, for more detial https://docs.expo.io/versions/latest/sdk/imagepicker/
      quality: 1,
    });

    if (!result.cancelled) {
      if (index === 0) {
        setFrontPhoto(result.uri);
        setFrontPhotoSelected(true);
        setFrontPhotoBase64(result.base64);
      } else if (index === 1) {
        setSidePhoto(result.uri);
        setSidePhotoSelected(true);
        setSidePhotoBase64(result.base64);
      }
    }
  };

  const takePhoto = async (index) => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      aspect: [1,2],
      quality: 1,
    });

    if (!result.cancelled) {
      if (index === 0) {
        setFrontPhoto(result.uri);
        setFrontPhotoSelected(true);
        setFrontPhotoBase64(result.base64);
      } else if (index === 1) {
        setSidePhoto(result.uri);
        setSidePhotoSelected(true);
        setSidePhotoBase64(result.base64);
      }
    }
  };

  const maleRadioHandler = () => {
    setFemaleCheck(false);
    setMaleCheck(true);
    setGender("male");
  };

  const femaleRadioHandler = () => {
    setMaleCheck(false);
    setFemaleCheck(true);
    setGender("female");
  };

  const weightHandler = (value) => {
    setWeight(value);
  };

  const heightHandler = (value) => {
    setHeight(value);
  };

  const onPressButton = (event, index) => {
    Alert.alert(
      "Photo source",
      "From where choose photo?",
      [
        { text: "Camera", onPress: () => takePhoto(index) },
        { text: "Gallery", onPress: () => selectPhoto(index) },
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  const onPressHandler = async () => {
    console.log("press pressed");
    createUser(gender, height, weight, frontPhotoBase64, sidePhotoBase64);
  };

  const createUser = async (gender, height, weight, frontPhotoBase64, sidePhotoBase64) => {
    var payload = {
      "gender": gender,
      "height": height,
      "weight": weight,
      "front_image": frontPhotoBase64,
      "side_image": sidePhotoBase64
    }

    const requestOptions = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        "Authorization": "APIKey 7d2aa9b773a8cd6d7f45ab30c5c991919ff0a198" 
      },
      body: JSON.stringify(payload)
    };
    
    const response = await fetch('https://saia.3dlook.me/api/v2/persons/?measurements_type=all', requestOptions);
    const data = await response.json();
    var myJSON = JSON.stringify(data);
    var tmp = myJSON.substring(17);
    tmp = tmp.substring(0, tmp.length-2)
    console.log(tmp);
    setTaskSetUrl(tmp);
    setTimeout(getSpecificTaskSet(tmp), 10000);  //TIMER
  }

  const getSpecificTaskSet = async (taskSetUrl) => {

    var urlToUser = '';

    const requestOptions = {
      method: 'GET',
      headers: { 
        "Authorization": "APIKey 7d2aa9b773a8cd6d7f45ab30c5c991919ff0a198" 
      },
    };

    const response = await fetch (taskSetUrl, requestOptions).then(response => {
      console.log(response.headers);
      urlToUser = JSON.stringify(response.headers).substring(19).substring(0,47);
      setUserUrl(urlToUser);
      console.log(urlToUser);
      setTimeout(getUserSizes(urlToUser), 5000);  //TIMER
      return response.json();
    })
    .then(responseJson => {
      console.log(responseJson);
    })
    .catch(error => {
      console.error(error);
    });
  }

  const getUserSizes = async(userUrl) => {

    const requestOptions = {
      method: 'GET',
      headers: { 
        "Authorization": "APIKey 7d2aa9b773a8cd6d7f45ab30c5c991919ff0a198" 
      },
    };

    const response = await fetch (userUrl, requestOptions).then(response => {
      return response.json();
    })
    .then(responseJson => {
      console.log(responseJson);
    })
    .catch(error => {
      console.error(error);
    });
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle = "dark-content" hidden = {false} backgroundColor = "#00BCD4" translucent = {true}/>
    <ScrollView >
      <View style={styles.container}>
          <View style={styles.headingContainer}>
            <Text style={styles.headingText}>Gender:</Text>
          </View>
          <View style={styles.genderContainer}>
            <Text style={styles.radioText}>Male: </Text>
            <RadioButton onPress={maleRadioHandler} checked={maleCheck} />
            <Text style={styles.radioText}>Female: </Text>
            <RadioButton checked={femaleCheck} onPress={femaleRadioHandler} />
          </View>
          <View>
            <TextInput
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="Weight"
              keyboardType="number-pad"
              onChangeText={weightHandler}
            />
            <TextInput
              style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="Height"
              keyboardType="number-pad"
              onChangeText={heightHandler}
            />
          </View>
          <View style={styles.genderContainer}>
            <View style={styles.photoColumn}>
              <Text style={styles.photoHeader}>Front Photo</Text>
              <ImageButton
                style={styles.btn}
                appearance={{
                  normal: frontPhotoSelected
                    ? { uri: frontPhoto }
                    : require("./assets/front.png"),
                  highlight: frontPhotoSelected
                    ? { uri: frontPhoto }
                    : require("./assets/front.png"),
                }}
                onPress={(event) => onPressButton(event, 0)}
              />
            </View>
            <View style={styles.photoColumn}>
              <Text style={styles.photoHeader}>Side Photo</Text>
              <ImageButton
                style={styles.btn}
                appearance={{
                  normal: sidePhotoSelected
                    ? { uri: sidePhoto }
                    : require("./assets/side.png"),
                  highlight: sidePhotoSelected
                    ? { uri: sidePhoto }
                    : require("./assets/side.png"),
                }}
                onPress={(event) => onPressButton(event, 1)}
              />
            </View>
          </View>
          <Button title="Calculate" onPress={onPressHandler} />
        <Text style={styles.bottomText}>
          Prototype mobile app for working with 3DLook
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  genderContainer: {
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  headingContainer: {
    marginHorizontal: 12,
  },
  headingText: {
    fontSize: 19,
    fontWeight: "400",
  },
  radioText: {
    marginHorizontal: 5,
    fontSize: 15,
  },
  input: {
    margin: 15,
    height: 40,
    width: 100,
    borderWidth: 1,
    textAlign: "center",
  },
  btn: {
    width: "75%",
    height: 175,
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    overflow: "hidden",
  },
  bottomText: {
    margin: 20,
    color: "#aaa",
  },
  photoColumn: {
    width: "50%",
    height: 175,
    margin: 20,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  photoHeader: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
