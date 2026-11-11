import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import DatabaseErrorBoundary from "../components/DatabaseErrorBoundary";
import { iniciarBanco } from "../database/iniciarBanco";

export default function RootLayout() {
    return (
        <DatabaseErrorBoundary>
            <Suspense
                fallback={
                    <View style={styles.carregamento} accessibilityRole="progressbar">
                        <ActivityIndicator color="#9A2F52" />
                        <Text style={styles.textoCarregamento}>Preparando o catálogo…</Text>
                    </View>
                }
            >
                <SQLiteProvider
                    databaseName="sorveteria.db"
                    onInit={iniciarBanco}
                    useSuspense
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

                    </Stack>
                </SQLiteProvider>
            </Suspense>
        </DatabaseErrorBoundary>
    );
}

const styles = StyleSheet.create({
    carregamento: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: "#FFF8F0",
    },
    textoCarregamento: {
        color: "#492411",
        fontSize: 16,
        fontWeight: "600",
    },
});
