import {View,Text,FlatList,StyleSheet} from "react-native"
const frutas =["Laranja", "Mamao", "Limao","Tangerina", "Uva"]
export default function Index () {
    return(
        <FlatList
        data={frutas}
        keyExtractor={(item)=>item}
        renderItem={
            ({item})=>(
                <View style={styles.item}>
                    <Text style={styles.texto}>{item}</Text>
                </View>
            )
        }
        
        
        />
    )
}
const styles = StyleSheet.create({
    item: {
        backgroundColor: "#949292",
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#222",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        padding: 12,
        gap: 16

    },
    texto: {fontSize:18}
})