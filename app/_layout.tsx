import { Stack } from "expo-router";
export default function RootLayout(){
    return (
        <Stack>
            <Stack.Screen name='Index' options={{title:"TelaPrincipal"}}/>
            <Stack.Screen name='Produto/[id]' options={{title:"Detalhe Sanduiche"}}/>
        </Stack>
    )
}