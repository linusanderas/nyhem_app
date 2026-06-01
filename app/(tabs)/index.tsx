import {
  View,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Pressable,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFocusEffect } from "expo-router";
import { useAd1 } from "@/lib/hooks";
import { AdBanner } from "@/components/AdBanner";
import {
  extractOpenNow,
  extractNextSession,
  extractTodayProgram,
  extractTodaySpeakers,
  formatEventTime,
  isEventLive,
  getTodayWeekdayPossessive,
  getEventIcon,
  TodaySpeaker,
} from "@/utils/helpers";
import { checkAndRefreshData } from "@/utils/dataRefresh";
import { AppEvent } from "@/types";
import { getStoredEvents, getStoredPages, getLastChange } from "@/lib/storage";
import { useState, useCallback, useEffect } from "react";
import LucideIcon from "@/lib/icons/LucideIcon";
import { useRouter } from "expo-router";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NextSessionCard({
  event,
  onPress,
}: {
  event: AppEvent;
  onPress: () => void;
}) {
  const speaker = event.speakers?.[0];
  const location = event.locations?.[0];
  const live = isEventLive(event);
  const description = event.text?.replace(/<[^>]*>/g, "").trim() || null;
  const eventIcon = getEventIcon(event);
  
  return (
    <Pressable onPress={onPress}>
      <Card className="p-4 border-2 border-primary">
        <View className="flex-row items-center mb-3">
          <Badge variant="default" className="rounded-md">
            <Text className="text-xs font-bold text-primary-foreground">
              {live ? "PÅGÅR" : "NÄSTA"}
            </Text>
          </Badge>
        </View>
        
        <View className="flex-row items-center gap-3 mb-3">
          <View className="w-11 h-11 rounded-lg bg-primary/15 items-center justify-center">
            <LucideIcon name={eventIcon} size={20} className="text-primary" />
          </View>
          <View className="flex-1">
            <Text className="text-primary font-semibold">
              {formatEventTime(event)}
            </Text>
            {location && (
              <View className="flex-row items-center gap-1 mt-0.5">
                <LucideIcon
                  name="MapPin"
                  size={14}
                  className="text-muted-foreground"
                />
                <Text className="text-caption text-muted-foreground">
                  {location.title}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <Text className="text-h4 font-bold">{event.title}</Text>
        
        {speaker && (
          <View className="flex-row items-center gap-2 mt-3">
            {speaker.imageUrl ? (
              <Image
                source={{ uri: speaker.imageUrl }}
                className="w-7 h-7 rounded-full bg-muted"
              />
            ) : (
              <View className="w-7 h-7 rounded-full bg-primary/20 items-center justify-center">
                <Text className="text-xs font-semibold text-primary">
                  {getInitials(speaker.title)}
                </Text>
              </View>
            )}
            <Text className="text-body">{speaker.title}</Text>
          </View>
        )}
        
        {description && (
          <Text
            className="text-caption text-muted-foreground mt-3"
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </Card>
    </Pressable>
  );
}

function SpeakerChip({
  speaker,
  onPress,
}: {
  speaker: TodaySpeaker;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card className="w-32 p-3 items-center">
        {speaker.imageUrl ? (
          <Image
            source={{ uri: speaker.imageUrl }}
            className="w-14 h-14 rounded-full bg-muted mb-2"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-primary/15 items-center justify-center mb-2">
            <Text className="text-base font-bold text-primary">
              {getInitials(speaker.name)}
            </Text>
          </View>
        )}
        <Text
          className="text-sm font-bold text-center w-full"
          numberOfLines={1}
        >
          {speaker.name}
        </Text>
        {speaker.subtitle && (
          <Text
            className="text-xs text-muted-foreground text-center w-full mt-0.5"
            numberOfLines={1}
          >
            {speaker.subtitle}
          </Text>
        )}
      </Card>
    </Pressable>
  );
}

function TodayProgramRow({
  event,
  onPress,
}: {
  event: AppEvent;
  onPress: () => void;
}) {
  const speaker = event.speakers?.[0];
  const live = isEventLive(event);
  const tagColor = event.tags?.[0]?.color || "#3a3a4a";
  const start = new Date(event.start_at);
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  
  return (
    <Pressable onPress={onPress} className="mb-2">
      <View
        className={`flex-row items-center rounded-2xl overflow-hidden ${live ? "border" : ""}`}
        style={{
          backgroundColor: tagColor,
          borderColor: "rgba(0,0,0,0.25)",
        }}
      >
        <View
          className="px-4 py-3"
          style={{
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
        >
          <Text className="text-white font-semibold text-sm">{time}</Text>
        </View>
        <View className="flex-1 px-3 py-2">
          <Text className="text-white font-bold" numberOfLines={1}>
            {event.title}
          </Text>
          {speaker && (
            <Text className="text-xs text-white/80" numberOfLines={1}>
              {speaker.title}
            </Text>
          )}
        </View>
        <View
          className="w-2 h-2 rounded-full mr-4"
          style={{
            backgroundColor: live ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)",
          }}
        />
      </View>
    </Pressable>
  );
}

const BUTTONS = [
  {
    label: "Webb-TV",
    icon: "tv",
    action: "https://www.tbnplay.se/browse",
  },
  {
    label: "Radio Nyhem",
    icon: "radio",
    infoId: 28,
  },
  {
    label: "Betala parkeringen",
    icon: "credit-card",
    action:
      'swish://payment?data={"payee":{"value":"1234567890"},"message":{"value":"parking","editable":false}}',
  },
  {
    label: "Ge en gåva",
    icon: "gift",
    action: 'swish://payment?data={"payee":{"value":"1234567890"}}',
  },
  {
    label: "Bärarlaget",
    icon: "heart-handshake",
    infoId: 145,
  },
  {
    label: "Bli volontär",
    icon: "heart",
    infoId: 144,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [nextSession, setNextSession] = useState<AppEvent | null>(null);
  const [todayProgram, setTodayProgram] = useState<AppEvent[]>([]);
  const [todaySpeakers, setTodaySpeakers] = useState<TodaySpeaker[]>([]);
  const [openNow, setOpenNow] = useState<
    {
      title: string;
      open: boolean;
      minutesUntilClose: number | null;
    }[]
  >([]);
  const { data: ads1 } = useAd1();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    let events = await getStoredEvents();
    let pages = await getStoredPages();
    const lastChange = await getLastChange();

    setNextSession(extractNextSession(events));
    setTodayProgram(extractTodayProgram(events));
    setTodaySpeakers(extractTodaySpeakers(events, pages));
    setOpenNow(extractOpenNow(events));

    await checkAndRefreshData(
      lastChange,
      (newEvents) => {
        events = newEvents;
        setNextSession(extractNextSession(newEvents));
        setTodayProgram(extractTodayProgram(newEvents));
        setTodaySpeakers(extractTodaySpeakers(newEvents, pages));
        setOpenNow(extractOpenNow(newEvents));
      },
      (newPages) => {
        pages = newPages;
        setTodaySpeakers(extractTodaySpeakers(events, newPages));
      },
      () => {},
    );
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      loadData();
      const interval = setInterval(loadData, 1000 * 60);
      return () => clearInterval(interval);
    }, [loadData]),
  );
  
  const handleButtonPress = (button: (typeof BUTTONS)[0]) => {
    if (button.action) {
      Linking.openURL(button.action);
    } else if (button.infoId) {
      router.push(`/info/${button.infoId}`);
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-background" edges={[]}>
      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Nästa session */}
        <Text className="text-xs font-bold text-muted-foreground tracking-wider mb-2">
          NÄSTA PROGRAMPUNKT
        </Text>
        {nextSession ? (
          <View className="mb-4">
            <NextSessionCard
              event={nextSession}
              onPress={() => router.push(`/event/${nextSession.id}`)}
            />
          </View>
        ) : (
          <Card className="mb-4 p-4">
            <Text className="text-body italic text-muted-foreground">
              Inga fler programpunkter just nu.
            </Text>
          </Card>
        )}
        
        {/* AdBanner */}
        <View className="mb-4">
          <AdBanner ad={ads1} />
        </View>
        
        {/* Dagens program */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs font-bold text-muted-foreground tracking-wider">
            {getTodayWeekdayPossessive()} PROGRAM
          </Text>
          <Pressable onPress={() => router.push("/program")}>
            <Text className="text-caption font-semibold text-primary">
              Se alla
            </Text>
          </Pressable>
        </View>
        <View className="mb-4">
          {todayProgram.length === 0 ? (
            <Card className="p-4">
              <Text className="text-body italic text-muted-foreground">
                Inget program idag.
              </Text>
            </Card>
          ) : (
            todayProgram.map((event) => (
              <TodayProgramRow
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))
          )}
        </View>
        
        {/* Öppet just nu */}
        <Text className="text-xs font-bold text-muted-foreground tracking-wider mb-2">
          ÖPPET JUST NU
        </Text>
        <Card className="mb-4 p-4">
          <FlatList
            data={openNow}
            keyExtractor={(item) => item.title}
            numColumns={2}
            columnWrapperStyle={{
              gap: 8,
            }}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="flex-1 flex-row items-center gap-1 py-1">
                <LucideIcon
                  name={item.open ? "CircleCheck" : "CircleX"}
                  size={16}
                  className={item.open ? "text-success" : "text-destructive"}
                />
                <Text className="text-caption flex-1" numberOfLines={1}>
                  {item.title}
                  {item.open && item.minutesUntilClose !== null && (
                    <Text className="text-muted-foreground">
                      {" "}({item.minutesUntilClose >= 120
                        ? `${Math.floor(item.minutesUntilClose / 60)} timmar till`
                        : `${item.minutesUntilClose} min till`})
                    </Text>
                  )}
                </Text>
              </View>
            )}
          />
        </Card>

        {/* Dagens talare */}
        {todaySpeakers.length > 0 && (
          <>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-bold text-muted-foreground tracking-wider">
                DAGENS TALARE
              </Text>
              <Pressable onPress={() => router.push("/speakers")}>
                <Text className="text-caption font-semibold text-primary">
                  Visa alla
                </Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              style={{ marginHorizontal: -16 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
              {todaySpeakers.map((speaker) => (
                <SpeakerChip
                  key={speaker.id}
                  speaker={speaker}
                  onPress={() => router.push(`/speaker/${speaker.id}`)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Button Grid */}
        <View className="flex-row flex-wrap -mx-1">
          {BUTTONS.map((button) => (
            <Pressable
              key={button.label}
              onPress={() => handleButtonPress(button)}
              className="w-1/2 px-1 py-1"
            >
              <View className="bg-primary rounded-lg py-3 px-2 items-center">
                <LucideIcon
                  name={button.icon as any}
                  size={20}
                  className="text-white mb-1"
                />
                <Text className="text-caption text-white text-center">
                  {button.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

