
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Svg, Circle, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import HorizontalCalendar from './horizontalCalendar';
import { schedulePeriodNotifications } from '@/utils/notifications';

const CYCLE_LENGTH = 28;
const PERIOD_LENGTH = 5;

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PeriodTracker: React.FC = () => {
    const [storedDate, setStoredDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [nextPeriodDate, setNextPeriodDate] = useState<string>('');
    const [daysLeft, setDaysLeft] = useState<number>(0);
    const [currentDay, setCurrentDay] = useState<number>(1);
    const [phase, setPhase] = useState<string>(''); // New for cycle phase

    useEffect(() => {
        checkStoredDate();
    }, []);

    // Greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good Morning';
        else if (hour >= 12 && hour < 17) return 'Good Afternoon';
        else if (hour >= 17 && hour < 21) return 'Good Evening';
        else return 'Good Night';
    };

    // Check if period ongoing based on current day
    const isPeriodOngoing = () => currentDay >= 1 && currentDay <= PERIOD_LENGTH;

    const checkStoredDate = async () => {
        const value = await AsyncStorage.getItem('periodDate');
        if (value) {
            const date = new Date(value);
            setStoredDate(date);
            calculateNextPeriod(date);
        } else {
            setShowPicker(true);
        }
    };

    const handleDateChange = async (
        event: DateTimePickerEvent,
        selectedDate?: Date
    ) => {
        if (selectedDate) {
            setShowPicker(false);
            setStoredDate(selectedDate);
            await AsyncStorage.setItem('periodDate', selectedDate.toISOString());
            calculateNextPeriod(selectedDate);
        }
    };

    const calculatePhase = (day: number) => {
        if (day >= 1 && day <= PERIOD_LENGTH) return 'Period';
        else if (day <= 14) return 'Follicular';
        else if (day <= 21) return 'Ovulation';
        else return 'Luteal';
    };

    const calculateNextPeriod = (startDate: Date) => {
        const today = new Date();
        let nextDate = new Date(startDate);

        while (nextDate < today) {
            nextDate.setDate(nextDate.getDate() + CYCLE_LENGTH);
        }

        const days = Math.ceil(
            (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        setDaysLeft(days);
        setNextPeriodDate(nextDate.toDateString());

        const mostRecentPeriodStart = new Date(nextDate);
        mostRecentPeriodStart.setDate(mostRecentPeriodStart.getDate() - CYCLE_LENGTH);

        const dayDiff = Math.ceil(
            (today.getTime() - mostRecentPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        setCurrentDay(dayDiff >= 1 ? dayDiff : 1);

        setPhase(calculatePhase(dayDiff));
    };

    const renderCalendarItem = ({ item }: { item: Date }) => {
        const isToday =
            item.toDateString() === new Date().toDateString();

        return (
            <View style={[styles.calendarItem, isToday && styles.calendarToday]}>
                <Text style={styles.calendarDay}>
                    {daysOfWeek[item.getDay()]}
                </Text>
                <Text style={styles.calendarDate}>{item.getDate()}</Text>
            </View>
        );
    };

    const generateNext14Days = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const renderCircularView = () => {
        const radius = 100;
        const circumference = 2 * Math.PI * radius;
        const progress = (currentDay / CYCLE_LENGTH) * circumference;

        return (
            <Svg height="350" width="350" viewBox="0 0 240 240">
                <Circle
                    cx="120"
                    cy="120"
                    r={radius}
                    stroke="#FFE5EC"
                    strokeWidth={25}
                    fill="none"
                />
                <Circle
                    cx="120"
                    cy="120"
                    r={radius}
                    stroke="#F06292"
                    strokeWidth={25}
                    fill="none"
                    strokeDasharray={`${progress},${circumference}`}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="120,120"
                />
                <SvgText
                    x="120"
                    y="95"
                    fontSize="12"
                    fontWeight="normal"
                    fill="#888" // grey
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    Current Phase
                </SvgText>

                {/* PERIOD (line 2) - pink and bold */}
                <SvgText
                    x="120"
                    y="115"
                    fontSize="18"
                    fontWeight="bold"
                    fill="#F06292" // pink
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    {phase}
                </SvgText>

                {/* Avg Cycle (line 3) - grey */}
                <SvgText
                    x="120"
                    y="135"
                    fontSize="12"
                    fontWeight="normal"
                    fill="#888"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    Average Cycle Length
                </SvgText>

                {/* Days (line 4) - maroon and bold */}
                <SvgText
                    x="99"
                    y="155"
                    fontSize="18"
                    fontWeight="bold"
                    fill="#800000" // maroon
                    textAnchor="middle"
                    alignmentBaseline="middle"
                >
                    {CYCLE_LENGTH}     days
                </SvgText>
            </Svg>

        );
    };

    const resetPeriodDate = async () => {
        await AsyncStorage.removeItem('periodDate');
        setStoredDate(null);
        setShowPicker(true);
        setNextPeriodDate('');
        setDaysLeft(0);
        setCurrentDay(1);
        setPhase('');
    };


    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <View>  {isPeriodOngoing() && (
                <Text style={styles.periodMessage}>
                    {`It's your day ${currentDay}`}
                </Text>
            )} </View>

            <View style={{ marginBottom: 13, paddingBottom: 0 }}>
                <HorizontalCalendar />
            </View>

            <View style={styles.circleContainer}>{renderCircularView()}</View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    Next Period:{' '}
                    <Text style={styles.infoValue}>{nextPeriodDate || '--'}</Text>
                </Text>
                <Text style={styles.infoText}>
                    Days Left: <Text style={styles.infoValue}>{daysLeft || '--'}</Text>
                </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.resetButton} onPress={resetPeriodDate}>
                    <Ionicons
                        name="refresh"
                        size={25}
                        color="#FFF0F3"
                        style={{ marginRight: 8, fontWeight: 'bold' }}
                    />
                    <Text style={styles.resetButtonText}>Reset Date</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reminderButton} onPress={() => {
                    if (storedDate) {
                        schedulePeriodNotifications(new Date(storedDate));
                        Alert.alert('Reminder ', "Reminder is set successfully");
                    } else {
                        Alert.alert('Reminder ', "No period date is stored.Kindly set the period date.");
                    }
                }
                }>
                    <Ionicons
                        name="notifications"
                        size={25}
                        color="#FFF0F3"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.reminderButtonText}>Set Reminder</Text>
                </TouchableOpacity>
            </View>

            {/* Date Picker */}
            {showPicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    style={{ backgroundColor: 'white' }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white', // White background as requested
        padding: 20,
        paddingTop: 40,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: '#880e4f',
        marginBottom: 6,
    },
    periodMessage: {
        fontSize: 19,
        color: '#D81B60',
        fontWeight: '600',
        marginBottom: 12,
    },
    calendarContainer: {
        marginVertical: 10,
    },
    calendarItem: {
        backgroundColor: '#FDE2E4',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginHorizontal: 6,
        alignItems: 'center',
        width: 70,
    },
    calendarToday: {
        backgroundColor: '#F48FB1',
    },
    calendarDay: {
        fontSize: 14,
        color: '#874C62',
        fontWeight: '600',
    },
    calendarDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D81B60',
    },
    circleContainer: {
        marginTop: -3,
        alignItems: 'center',
        marginVertical: 10,
        justifyContent: 'center',

    },
    infoContainer: {
        marginTop: 6,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 18,
        color: '#874C62',
        fontWeight: '600',
        marginBottom: 6,
    },
    infoValue: {
        color: '#D81B60',
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-between',
        gap: 10,
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#AD1457',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#AD1457',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,

    },
    resetButtonText: {
        color: '#FFF0F3',
        fontSize: 17,
        fontWeight: '700',
        textAlign: 'center',
    },
    reminderButton: {
        flex: 1,
        backgroundColor: '#F06292',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#F06292',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    reminderButtonText: {
        color: '#FFF0F3',
        fontSize: 17,
        fontWeight: '700',
        textAlign: 'center',
    },
});

export default PeriodTracker;
