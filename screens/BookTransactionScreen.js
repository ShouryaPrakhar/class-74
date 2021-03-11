import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image,Alert,KeyboardAvoidingView , ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../config'
import { disableExpoCliLogging } from 'expo/build/logs/Logs';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: "",
        scannedStudentId:"",
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async () =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      this.setState({
        scanned: true,
        scannedData: data,
        buttonState: 'normal'
      });
    }

initiateBookIssue = async() => {
  db.collection("transactions").add({
   'bookId':this.state.scannedBookId,
   'studentId':this.state.scannedStudentId,
   'dateOfTransaction':firebase.firestore.Timestamp.now().toDate(),
   'transactionType':'Issue'
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    'bookAvailability':false
  })
  db.collection('students').doc(this.state.scannedStudentId).update({
    'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
  })
  Alert.alert("Book Issued")
  this.setState({
    scannedBookId:"",
    scannedStudentId:""
  })
}

initiateBookReturn = async() => {
  db.collection("transactions").add({
   'bookId':this.state.scannedBookId,
   'studentId':this.state.scannedStudentId,
   'dateOfTransaction':firebase.firestore.Timestamp.now().toDate(),
   'transactionType':'Return'
  })
  db.collection("books").doc(this.state.scannedBookId).update({
    'bookAvailability':true
  })
  db.collection('students').doc(this.state.scannedStudentId).update({
    'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
  })
  Alert.alert("Book Retruned")
  this.setState({
    scannedBookId:"",
    scannedStudentId:""
  })
}
  
handleTransaction = async() => {
var transactionType = await this.checkBookEligibility
if(!transactionType){
  Alert.alert("The Book Doesnt Exist in the Library")
  this.setState({
    scannedStudentId:"",
    scannedBookId:"",
  })
}
else if(transactionType === "Issue"){
  var isStudentEligible = await this.checkStudentEligibilityForBookIssue()
  if(isStudentEligible){
    this.initiateBookIssue()
    Alert.alert("Book issued to the Student")
  }
}
else {
  var isStudentEligible = await this.checkStudentEligibilityForReturn()
  if(isStudentEligible){
    this.initiateBookReturn()
    Alert.alert("Book  returned to the Library")
  }
}
return transactionType
}

checkStudentEligibilityForBookIssue = async() => {
  const studentRef = await db.collection("students").where("studentId" , "==" , this.state.scannedStudentId).get()
  var isStudentEligible = ""
  if(this.studentRef.docs.length == 0){
    this.setState({
      scannedBookId:"",
      scannedStudentId: ""
    })
    isStudentEligible = false
    Alert.alert("Student doesnt exist")
  }
  else{
    studentRef.docs.map((doc) => {
      var student = doc.data()
      if(student.numberOfBooksIssued<2){
        isStudentEligible = true
      }
      else{
        isStudentEligible = false
        Alert.alert("The student has issued two books")
        this.setState({
          scannedStudentId:"",
          scannedBookId:""
        })
      }
    })
  }
  return isStudentEligible
}

checkStudentEligibilityForReturn = async() => {
  const transactionRef = await db.collection("transactions").where("bookId" , "==" , this.state.scannedBookId).limit(1).get()
  var isStudentEligible = ""
  transactionRef.docs.map((doc) => {
    var lastBookTransaction = doc.data()
    if(lastBookTransaction.studentId === this.state.scannedStudentId){
      isStudentEligible = true
    }
    else{
      isStudentEligible = false
      Alert.alert("The book wasnt  issued bye the student")
      this.setState({
        scannedStudentId:"",
        scannedBookId:""
      })
    }
  })
 return isStudentEligible
}

checkBookEligibility = async() => {
const bookRef = await db.collection("books").where("bookId" , "==" , this.state.scannedBookId).get()
var transactionType = ""
if(bookRef.docs.length == 0){
  transactionType = false
}
else{
  bookRef.docs.map((doc) => {
    var book = doc.data()
      if( book.bookAvailability){
        transactionType = "Issue"
      }
      else{
transactionType = "Return"
      }  
  })
}
return transactionType
}


    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        ); 
        
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style = {styles.container} behavior = "padding" enabled>
          <View>
            <View>
              <Image
              source = {require('../assets/booklogo.jpg')}
              style = {{width:200,height:200}}/>
              <Text style = {{textAlign:'center',fontSize:30}}>
                WILY
              </Text>
            </View>
          <View
          style = {styles.inputView}>
          <TextInput
          style = {styles.inputBox}
          placeholder = "Book Id"
          onChangeText = {text => this.setState({scannedBookId:text})}
          value = {this.state.scannedBookId}/>
          <TouchableOpacity style = {styles.scanButton}
          onPress = {() => {
            this.getCameraPermissions("BookId")
          }} >
          <Text style={styles.buttonText}>Scan</Text>
          </TouchableOpacity>
          </View>

          <View
          style = {styles.inputView}>
          <TextInput
          style = {styles.inputBox}
          placeholder = "Student Id"
          onChangeText = {text => this.setState({scannedStudentId:text})}
          value = {this.state.scannedStudentId}/>
          <TouchableOpacity style = {styles.scanButton}
            onPress = {() => {
              this.getCameraPermissions("StudentId")
            }}>
          <Text style={styles.buttonText}>Scan</Text>
          </TouchableOpacity>
          </View>
          <TouchableOpacity style = {styles.submitButton}
          onPress = {async() => {
            var transactionMessage = this.handleTransaction()
            this.setState({
              scannedBookId:"",
              scannedStudentId:""
            })
          }}>
            <Text style = {styles.submitButtonText}>
              SUBMIT
            </Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign:'center',
      marginTop:10
    },
    inputBox:{
      width:200,
      height:40,
      borderWidth:1.5,
      borderRightWidth:0,
      fontSize:20,
    },
    inputView:{
      flexDirection:'row',
      marginTop:20,
    },
    scanButton:{
      backgroundColor:"#66bb6a",
      width:50,
      borderWidth:1.5,
      borderLeftWidth:0,
    },
    submitButton:{
      backgroundColor:"#fbc02d",
      width:100,
      height:50
    },
    submitButtonText:{
      padding:10,
      textAlign:'center',
      fontSize:20,
      fontWeight:'bold',
      color:"white"
    }
  });