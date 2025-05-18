import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef, } from 'react'
import { ScrollView, View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { Link,useRouter } from 'expo-router'




const AnimatedCircle = Animated.createAnimatedComponent(Circle);


const QUICK_ACTIONS = [
    {
        icon: "add-circle-outline" as const,
        label: "Add\nMedication",
        route: "/medications/add" as const,
        color: "#2E7D32",
        gradient: ["#4CAF50", "#2E7D32"] as [string, string],
    },
    {
        icon: "calendar-outline" as const,
        label: "Calendar\nView",
        route: "/calendar" as const,
        color: "#1976D2",
        gradient: ["#2196F3", "#1976D2"] as [string, string],
    },
    {
        icon: "time-outline" as const,
        label: "History\nLog",
        route: "/history" as const,
        color: "#C2185B",
        gradient: ["#E91E63", "#C2185B"] as [string, string],
    },
    {
        icon: "medical-outline" as const,
        label: "Refill\nTracker",
        route: "/refills" as const,
        color: "#E64A19",
        gradient: ["#FF5722", "#E64A19"] as [string, string],
    },
];


const { width } = Dimensions.get("window");

interface CircularProgressProps {
    progress: number;
    totalDoses: number;
    completedDoses: number;
}


function CircularProgress({
    progress,
    totalDoses,
    completedDoses,
}: CircularProgressProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const size = width * 0.55;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: progress,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [progress]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressTextContainer}>
                <Text style={styles.progressPercentage}>
                    {Math.round(progress * 100)}%
                </Text>
                <Text style={styles.progressDetails}>
                    {completedDoses} of {totalDoses} doses
                </Text>
            </View>
            <Svg width={size} height={size} style={styles.progressRing}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="white"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
        </View>
    );


}

export default function HomeScreen() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View style={styles.flex1}>
                            <Text style={styles.greeting}>Daily Progress </Text>
                        </View>
                        <TouchableOpacity style={styles.notificationButton}>
                            <Ionicons name="notifications-outline" size={24} color={"white"} />
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationCount}></Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <CircularProgress
                        progress={0.5}
                        completedDoses={5}
                        totalDoses={10}
                    />
                </View>
            </LinearGradient>


            <View style={styles.content}>
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        {QUICK_ACTIONS.map((action) => (
                            <Link href={action.route} key={action.label} asChild>
                                <TouchableOpacity style={styles.actionButton}>
                                    <LinearGradient
                                        colors={action.gradient}
                                        style={styles.actionGradient}
                                    >
                                        <View style={styles.actionContent}>
                                            <View style={styles.actionIcon}>
                                                <Ionicons name={action.icon} size={28} color="white" />
                                            </View>
                                            <Text style={styles.actionLabel}>{action.label}</Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>
                </View>
            </View>


        </ScrollView>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        paddingTop: 50,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        alignItems: "center",
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 20,
    },
    greeting: {
        fontSize: 18,
        fontWeight: "600",
        color: "white",
        opacity: 0.9,
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    quickActionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    quickActionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 15,
    },
    actionButton: {
        width: (width - 52) / 2,
        height: 110,
        borderRadius: 16,
        overflow: "hidden",
    },
    actionGradient: {
        flex: 1,
        padding: 15,
    },
    actionContent: {
        flex: 1,
        justifyContent: "space-between",
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "white",
        marginTop: 8,
    },
    section: {
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "green",
        marginBottom: 5,
    },
    seeAllButton: {
        color: "#2E7D32",
        fontWeight: "600",
    },
    doseCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    doseBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    doseInfo: {
        flex: 1,
        justifyContent: "space-between",
    },
    medicineName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    dosageInfo: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    doseTime: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        marginLeft: 5,
        color: "#666",
        fontSize: 14,
    },
    takeDoseButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginLeft: 10,
    },
    takeDoseText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
    },
    progressContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
    },
    progressTextContainer: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    progressPercentage: {
        fontSize: 36,
        fontWeight: "bold",
        color: "white",
    },
    progressLabel: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
        marginTop: 4,
    },
    progressRing: {
        transform: [{ rotate: "-90deg" }],
    },
    flex1: {
        flex: 1,
    },
    notificationButton: {
        position: "relative",
        padding: 8,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 12,
        marginLeft: 8,
    },
    notificationBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#FF5252",
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#146922",
        paddingHorizontal: 4,
    },
    notificationCount: {
        color: "white",
        fontSize: 11,
        fontWeight: "bold",
    },
    progressDetails: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    closeButton: {
        padding: 5,
    },
    notificationItem: {
        flexDirection: "row",
        padding: 15,
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        marginBottom: 10,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E8F5E9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: "#999",
    },
    emptyState: {
        alignItems: "center",
        padding: 30,
        backgroundColor: "white",
        borderRadius: 16,
        marginTop: 10,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#666",
        marginTop: 10,
        marginBottom: 20,
    },
    addMedicationButton: {
        backgroundColor: "#1a8e2d",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    addMedicationButtonText: {
        color: "white",
        fontWeight: "600",
    },
    takenBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginLeft: 10,
    },
    takenText: {
        color: "#4CAF50",
        fontWeight: "600",
        fontSize: 14,
        marginLeft: 4,
    },
});