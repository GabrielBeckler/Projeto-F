import {View,Text,StyleSheet,Image,TouchableOpacity} from 'react-native'
import { router } from 'expo-router'
import { arrayProdType } from '../types/prodType'

type Props = {produto: arrayProdType}
export default function ProdutoCard ({produto} : Props) {
    return (
        <TouchableOpacity style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.titulo}>{produto.titulo}</Text>
                <Text style={styles.preco}>{produto.preco}</Text>
                <Text style={styles.descricao}>{produto.descricao}</Text>
            </View>
            <Image style={styles.imagem} source={produto.imagem}/>
        </TouchableOpacity>
    )}

const styles = StyleSheet.create({
    card:{
        backgroundColor:"#d9d8d8",
        marginHorizontal:12,
        marginVertical:12,
        borderRadius:12,
        elevation:3,
        shadowColor:"#111",
        shadowOpacity:0.08,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical:12,
        paddingHorizontal:16
    },
    info:{flex:1,gap:16},
    titulo:{fontSize:20,fontWeight:700,color:"#111"},
    preco:{fontSize:20,fontWeight:600,color:"#f50505"},
    descricao:{fontSize:15,fontWeight:500,color:"#111"},
    imagem:{
        width:110,
        height:110,
        borderRadius:130,
        marginLeft:12
    }

})