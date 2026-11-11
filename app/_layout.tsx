import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { iniciarBanco } from "../database/iniciarBanco";

export default function RootLayout() {
    return (
        <SQLiteProvider
            databaseName="sorveteria.db"
            onInit={iniciarBanco}
        >
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{
                        title: "Gelato App",
                        headerShown: false,
                    }}
                />

                <Stack.Screen
                    name="lista"
                    options={{
                        title: "Gelato App",
                        headerTitle: "",
                        headerBackTitle: "",
                        headerBackButtonDisplayMode: "minimal",
                        headerShadowVisible: false,
                    }}
                />

                <Stack.Screen
                    name="produto/[id]"
                    options={{
                        title: "Detalhes do sorvete",
                    }}
                />
            </Stack>
        </SQLiteProvider>
    );
}