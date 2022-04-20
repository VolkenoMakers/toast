import React, { ReactElement, useContext } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

enum TOAST_TYPES {
  success,
  error,
}

type MessageType = {
  id: string;
  type: TOAST_TYPES.success | TOAST_TYPES.error;
  text: string;
  duration: number;
};

const DIMENSIONS = Dimensions.get("screen");
const ToastMessagesContext = React.createContext({
  messages: [],
  setMessages: (message: MessageType) => {},
} as { messages: MessageType[]; setMessages: any });

export const ToastProvider = ({ children }: { children: ReactElement }) => {
  const [messages, setMessages] = React.useState<MessageType[]>([]);
  return (
    <ToastMessagesContext.Provider value={{ messages, setMessages }}>
      <View style={{ flex: 1 }}>
        <Toast />
        {children}
      </View>
    </ToastMessagesContext.Provider>
  );
};

function Toast() {
  const { messages } = useContext(ToastMessagesContext);
  if (messages.length === 0) return null;
  return (
    <View
      style={{
        position: "absolute",
        top: 24,
        left: 0,
        right: 0,
        zIndex: 2,
        elevation: 2,
      }}
    >
      {messages.map((message) => (
        <Message message={message} key={message?.id} />
      ))}
    </View>
  );
}

const SUCCESS_COLOR = "#16a085";
const ERROR_COLOR = "#c0392b";
const INDICATOR_WIDTH = DIMENSIONS.width - 30;

function Message({ message }: { message: MessageType }) {
  let {
    type = TOAST_TYPES.success,
    text,
    duration = 6000,
  } = typeof message === "string" ? { text: message } : message;
  const { setMessages } = useContext(ToastMessagesContext);
  const width = React.useRef(new Animated.Value(0)).current;
  const opacity = React.useRef(new Animated.Value(0.1)).current;
  const [stopValue, setStopValue] = React.useState(0);
  const animateIndicator = React.useCallback(() => {
    const pourcent = stopValue / INDICATOR_WIDTH;
    const dur = duration * (1 - pourcent);
    Animated.timing(width, {
      toValue: INDICATOR_WIDTH,
      duration: dur,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setMessages((old: MessageType[]) => {
          return old.filter((f: MessageType) => f.id !== message.id);
        });
      }
    });
  }, [stopValue]);
  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      useNativeDriver: true,
      duration: 400,
    }).start(animateIndicator);
  }, []);
  const is_success = type === TOAST_TYPES.success;
  const scale = opacity.interpolate({
    inputRange: [0, 0.8],
    outputRange: [0.5, 1],
    extrapolate: "clamp",
  });
  const translateY = opacity.interpolate({
    inputRange: [0.7, 1],
    outputRange: [10, 0],
    extrapolate: "clamp",
  });
  return (
    <TouchableWithoutFeedback
      onPressIn={() => {
        width.stopAnimation((value) => setStopValue(value));
      }}
      onPressOut={() => {
        animateIndicator();
      }}
      style={{ borderRadius: 5, overflow: "hidden" }}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }, { translateY }],
          backgroundColor: "#FFF",
          marginBottom: 4,
          marginHorizontal: 15,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: is_success ? SUCCESS_COLOR : ERROR_COLOR,
            width: width,
            height: 4,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "stretch",
              }}
            >
              <View
                style={{
                  width: 3,
                  backgroundColor: is_success ? SUCCESS_COLOR : ERROR_COLOR,
                }}
              />
              <Text
                style={{
                  color: "#000",
                  fontSize: 12,
                  paddingHorizontal: 5,
                  paddingVertical: 10,
                }}
              >
                {text}
              </Text>
            </View>
          </View>
          <View style={{ marginHorizontal: 5 }}>
            <TouchableOpacity
              onPress={() => {
                setMessages((old: MessageType[]) => {
                  return old.filter((f: MessageType) => f.id !== message.id);
                });
              }}
            >
              <Image
                source={require("./clear.png")}
                style={{ width: 24, height: 24, tintColor: "#FFF" }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
export function useToast() {
  const { setMessages } = useContext(ToastMessagesContext);
  const success = React.useCallback((message: string, duration = 4000) => {
    const data = {
      type: TOAST_TYPES.success,
      text: message,
      duration: duration,
      id: new Date().getTime(),
    };
    setMessages((old: MessageType[]) => [data, ...old]);
  }, []);
  const error = React.useCallback((message: string, duration = 4000) => {
    const data = {
      type: TOAST_TYPES.error,
      text: message,
      duration: duration,
      id: new Date().getTime(),
    };
    setMessages((old: MessageType[]) => [data, ...old]);
  }, []);
  return {
    success,
    error,
  };
}
