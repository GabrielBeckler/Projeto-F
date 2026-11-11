import { useState } from 'react'
import {View,Text,StyleSheet,Image,TouchableOpacity} from 'react-native'
import { arrayProdType } from '../types/prodType'

type Props = {produto: arrayProdType};

export default function ProdutoCard ({produto} : Props) {
    const [expandido, setExpandido] = useState(false);
    const [menuAberto, setMenuAberto] = useState(false);

    return (
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.conteudo}
                onPress={() => setExpandido((anterior) => !anterior)}
                accessibilityRole="button"
                accessibilityState={{ expanded: expandido }}
            >
                <View style={styles.info}>
                    <Text style={styles.titulo}>{produto.titulo}</Text>
                    <Text style={styles.preco}>{produto.preco}</Text>
                    <Text>
                        {expandido
                            ? "Ocultar descrição ▲"
                            : "Ver descrição ▼"}
                    </Text>
                    {expandido && (
                        <Text style={styles.descricao}>
                            {produto.descricao}
                        </Text>
                    )}
                </View>
                <Image 
                    style={styles.imagem} 
                    source={produto.imagem}
                />
            </TouchableOpacity>
            
            <View style={styles.areaOpcoes}>
                <TouchableOpacity
                    style={styles.botaoOpcoes}
                    onPress={() => setMenuAberto((anterior) => !anterior)}
                    accessibilityRole="button"
                    accessibilityLabel={`Opções de ${produto.titulo}`}
                    accessibilityState={{ expanded: menuAberto }}
                >
                <Text style={styles.pontinhos}>⋮</Text>
            </TouchableOpacity>

            {menuAberto && (
                <View style={styles.menu}>
                    <TouchableOpacity
                        style={styles.itemMenu}
                        onPress={() => {
                            setMenuAberto(false);
                            console.log('Editar produto:', produto.titulo);
                        }}
                    >
                        <Text>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.itemMenu}
                        onPress={() => {
                            setMenuAberto(false);
                            console.log('Deletar produto:', produto.titulo);
                        }}
                    >
                        <Text style={styles.textoExcluir}>Deletar</Text>
                    </TouchableOpacity>
                </View>
            )}
            </View>
        </View>
    );
}

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
        alignItems: "flex-start",
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
    },
    conteudo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },

    areaOpcoes: {
        alignItems: "center",
        marginLeft: 8,
    },

    botaoOpcoes: {
        minWidth: 44,
        minHeight: 44,
        alignItems: "center",
        justifyContent: "center",
    },

    pontinhos: {
        fontSize: 28,
        color: "#111",
    },

    menu: {
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingVertical: 4,
    },

    itemMenu: {
        minHeight: 44,
        justifyContent: "center",
        paddingHorizontal: 12,
    },

    textoExcluir: {
        color: "#c62828",
    }

})