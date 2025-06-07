import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";

const PHASES = [
    { label: "Inhale", duration: 4000 },
    { label: "Hold", duration: 2000 },
    { label: "Exhale", duration: 4000 },
    { label: "Hold", duration: 2000 },];

const SESSION_DURATION_MS = 60 * 1000; // 1 minute

const THEMES = {
    forest: {
        background: "#0B3D0B",
        circle: "#4CAF50",
        button: "#1B5E20",
        text: "#fff",
    },
    ocean: {
        background: "#003B46",
        circle: "#4DB6AC",
        text: "#fff",
        button: "#0D47A1",
    },
    space: {
        background: "#1A1A40",
        circle: "#5C6BC0",
        text: "#fff",
        button: "#4527A0",
    },
};

export default function BreathingExercise() {
    const router= useRouter();
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState(SESSION_DURATION_MS);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [theme, setTheme] = useState<keyof typeof THEMES>("ocean");

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        (async () => {
            const { sound } = await Audio.Sound.createAsync(
                require("./../../assets/chime-74910.mp3")
            );
            soundRef.current = sound;
        })();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        if (isRunning && soundRef.current) {
            soundRef.current.replayAsync();
        }
    }, [phaseIndex, isRunning]);

    // Handle breathing animation & phase cycle
    useEffect(() => {
        if (!isRunning || sessionComplete) return;

        if (remainingTime <= 0) {
            setSessionComplete(true);
            setIsRunning(false);
            return;
        }

        if (PHASES[phaseIndex].label === "Inhale") {
            Animated.timing(scaleAnim, {
                toValue: 2,
                duration: PHASES[phaseIndex].duration,
                useNativeDriver: true,
            }).start();
        } else if (PHASES[phaseIndex].label === "Exhale") {
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: PHASES[phaseIndex].duration,
                useNativeDriver: true,
            }).start();
        } else {
            // Hold phases - set scale to either 2 or 1 depending on previous phase
            if (phaseIndex === 1) {
                // Hold after Inhale (phase 1 in PHASES array)
                scaleAnim.setValue(2);
            } else if (phaseIndex === 3) {
                // Hold after Exhale (phase 3)
                scaleAnim.setValue(1);
            }
        }
        const phaseTimer = setTimeout(() => {
            setPhaseIndex((prev) => (prev + 1) % PHASES.length);
        }, PHASES[phaseIndex].duration);

        return () => clearTimeout(phaseTimer);
    }, [phaseIndex, isRunning, sessionComplete]);

    // Timer countdown
    useEffect(() => {
        if (!isRunning) return;

        const start = Date.now();

        intervalRef.current = setInterval(() => {
            setRemainingTime((prev) => {
                const elapsed = Date.now() - start;
                const newTime = Math.max(0, SESSION_DURATION_MS - elapsed);
                if (newTime === 0) {
                    clearInterval(intervalRef.current!);
                    setSessionComplete(true);
                    setIsRunning(false);
                }
                return newTime;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    // Controls
    const onStartPause = () => {
        if (sessionComplete) {
            Alert.alert(
                "Session Completed",
                "Please reset to start again.",
                [{ text: "OK" }],
                { cancelable: false }
            );
            return;
        }
        setIsRunning((prev) => !prev);
    };




    const onReset = () => {
        setIsRunning(false);
        setPhaseIndex(0);
        setRemainingTime(SESSION_DURATION_MS);
        setSessionComplete(false);
        scaleAnim.setValue(1);
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: THEMES[theme].background },
            ]}
        >
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name='chevron-back' size={28} color='#1a8e2d' />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Breathing Exercise</Text>
            </View>
            {sessionComplete ? (
                <>
                    <Text style={styles.label}>🎉 Well Done!</Text>
                    <Text style={styles.subText}>You completed your session.</Text>
                </>
            ) : (
                <>

                    <View style={styles.textContainer}>
                        <Text style={styles.label}>{PHASES[phaseIndex].label}...</Text>
                        <Text style={styles.timerText}>Remaining: {Math.ceil(remainingTime / 1000)}s</Text>
                    </View>


                    <View style={styles.circleContainer}>
                        <Animated.View
                            style={[
                                styles.circle,
                                {
                                    backgroundColor: THEMES[theme].circle,
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        />
                    </View>

                    <View style={styles.controlPanel}>
                        {/* Start / Pause & Reset Buttons */}
                        <View style={styles.controlsRow}>
                            <TouchableOpacity onPress={onStartPause} style={styles.transparentButton}>
                                <Ionicons name={isRunning ? "pause" : "play"} size={28} color="#fff" />
                                <Text style={styles.buttonText}>{isRunning ? "Pause" : "Start"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onReset} style={styles.transparentButton}>
                                <Ionicons name="refresh" size={28} color="#fff" />
                                <Text style={styles.buttonText}>Reset</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Theme Selector */}
                        <Text style={styles.themeLabel}>Select Theme:</Text>
                        <View style={styles.themeSelector}>
                            {(["forest", "ocean", "space"] as (keyof typeof THEMES)[]).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setTheme(t)}
                                    style={[
                                        styles.themeCircle,
                                        {
                                            backgroundColor: THEMES[t].circle,
                                            borderWidth: theme === t ? 3 : 1,
                                            borderColor: theme === t ? "#fff" : "#aaa",
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    </View>



                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "white",
        marginLeft: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 20,
        zIndex: 1,
        marginTop:35
    },
    container: {
        flex: 1,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    circle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        opacity: 0.8,
        marginBottom: 30,
    },
    label: {
        fontSize: 28,
        color: "white",
        fontWeight: "bold",
        marginBottom: 8,

        textAlign: "center",
    },
    timerText: {
        fontSize: 18,
        color: "#B2DFDB",
        marginTop: 10,
        marginBottom: 20,
    },
    subText: {
        fontSize: 20,
        color: "#AED581",
        marginTop: 8,
        textAlign: "center",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 20,
        marginBottom: 24,
    },
    button: {
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 30,
    },
    buttonGrid: {
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        marginBottom: 80

    },
    themeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    themeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    themeButtonText: {
        color: "white",
        fontWeight: "600",
        textTransform: "capitalize",
    },
    textContainer: {
        position: "absolute",
        top: 130,
        width: "100%",
        alignItems: "center",
        zIndex: 10,
    },

    circleContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 200, // push down to avoid overlapping texts
        width: "100%",
    },
    controlPanel: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
        paddingBottom: 60,
        width: "100%",
        gap: 20,
    },

    controlsRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 30,
    },

    transparentButton: {
        borderColor: "#fff",
        borderWidth: 1.5,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        backgroundColor: "rgba(255,255,255,0.05)", // subtle glassy look
    },

    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
    },

    themeLabel: {
        fontSize: 16,
        color: "#AED581",
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 5,
    },

    themeSelector: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
    },

    themeCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },

});

