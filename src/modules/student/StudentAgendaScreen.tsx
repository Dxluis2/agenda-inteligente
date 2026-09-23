import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth } from '../../services/firebase/firebaseConfig';

import {
  StudentTaskProgress,
  TaskProgressService,
} from '../../services/task/TaskProgressService';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '../../theme';

export default function StudentAgendaScreen() {

  const [tasks,setTasks]=useState<StudentTaskProgress[]>([]);

  const loadTasks=async()=>{

    try{

      const user=auth.currentUser;

      if(!user) return;

      const data=await TaskProgressService.getStudentTasks(user.uid);

      setTasks(data);

    }catch(error:any){

      Alert.alert('Error',error.message);

    }

  }

  useEffect(()=>{

    loadTasks();

  },[]);

  const pending=useMemo(()=>tasks.filter(x=>!x.completed),[tasks]);

  const completed=useMemo(()=>tasks.filter(x=>x.completed),[tasks]);

  const complete=async(id:string)=>{

    await TaskProgressService.completeTask(id);

    loadTasks();

  }

  return(

<View style={styles.container}>

<Text style={styles.title}>
Mi Agenda
</Text>

<View style={styles.resume}>

<View style={styles.box}>
<Text style={styles.number}>{pending.length}</Text>
<Text>Pendientes</Text>
</View>

<View style={styles.box}>
<Text style={styles.number}>{completed.length}</Text>
<Text>Completadas</Text>
</View>

</View>

<FlatList

data={pending}

keyExtractor={(item)=>item.id}

renderItem={({item})=>(

<View style={styles.card}>

<Text style={styles.subject}>
{item.subjectName}
</Text>

<Text style={styles.task}>
{item.title}
</Text>

<Text>
{item.dueDate} {item.dueTime}
</Text>

<TouchableOpacity
style={styles.button}
onPress={()=>complete(item.id)}
>

<Text style={styles.buttonText}>
Marcar como completada
</Text>

</TouchableOpacity>

</View>

)}

/>

</View>

);

}

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:Colors.background,
padding:20,
paddingTop:60,
},

title:{
fontSize:30,
fontWeight:'900',
marginBottom:20,
color:Colors.text,
},

resume:{
flexDirection:'row',
gap:15,
marginBottom:20,
},

box:{
flex:1,
backgroundColor:Colors.surface,
padding:20,
borderRadius:Radius.lg,
alignItems:'center',
...Shadows.card,
},

number:{
fontSize:28,
fontWeight:'900',
color:Colors.primary,
},

card:{
backgroundColor:Colors.surface,
padding:20,
borderRadius:Radius.lg,
marginBottom:15,
...Shadows.card,
},

subject:{
fontWeight:'900',
fontSize:18,
color:Colors.primary,
},

task:{
fontWeight:'800',
fontSize:16,
marginVertical:8,
},

button:{
marginTop:15,
backgroundColor:Colors.success,
padding:14,
borderRadius:12,
},

buttonText:{
color:'white',
textAlign:'center',
fontWeight:'900',
},

});