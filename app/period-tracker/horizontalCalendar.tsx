import { FlatList, View, Text, Dimensions } from 'react-native';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface DayItem {
    dayInitial: string;
    dateNumber: number;
    isToday: boolean;
}

const ITEM_WIDTH = 72;


const HorizontalCalendar: React.FC = () => {
    const today = new Date();
    const todayDate = today.getDate();

    const calendarDays: DayItem[] = [];

    for (let i = -7; i <= 6; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        calendarDays.push({
            dayInitial: DAYS[d.getDay()],
            dateNumber: d.getDate(),
            isToday: d.toDateString() === today.toDateString(),
        });
    }

    const renderItem = ({ item }: { item: DayItem }) => (
        <View style={{ alignItems: 'center', marginHorizontal: 6 }}>
            <Text style={{ color: '#999', fontWeight: '600', fontSize: 14 }}>{item.dayInitial}</Text>
            <View
                style={{
                    marginTop: 4,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: item.isToday ? '#F06292' : 'transparent',
                }}
            >
                <Text style={{ color: item.isToday ? '#fff' : '#000', fontWeight: '900', fontSize: 16 }}>
                    {item.dateNumber}
                </Text>
            </View>
        </View>
    );

    return (
        <FlatList
            horizontal
            data={calendarDays}
            renderItem={renderItem}
            initialScrollIndex={7}
            keyExtractor={(item) => item.dayInitial + item.dateNumber}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: (Dimensions.get('window').width / 2) - ITEM_WIDTH / 2, marginVertical: 12 }}

            getItemLayout={(_, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index,
            })}
        />
    );
};

export default HorizontalCalendar;