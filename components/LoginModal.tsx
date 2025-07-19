import React, { useState, useRef, useEffect } from "react";
import { Modal, View, TextInput, StyleSheet, ActivityIndicator, useTVEventHandler } from "react-native";
import { usePathname } from "expo-router";
import Toast from "react-native-toast-message";
import useAuthStore from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import useHomeStore from "@/stores/homeStore";
import { api } from "@/services/api";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { StyledButton } from "./StyledButton";

const LoginModal = () => {
  const { isLoginModalVisible, hideLoginModal, checkLoginStatus } = useAuthStore();
  const { serverConfig, apiBaseUrl } = useSettingsStore();
  const { refreshPlayRecords } = useHomeStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const loginButtonRef = useRef<View>(null);
  const [focused, setFocused] = useState("username");
  const pathname = usePathname();
  const isSettingsPage = pathname.includes("settings");

  const tvEventHandler = (evt: any) => {
    if (!evt || !isLoginModalVisible || isSettingsPage) {
      return;
    }

    const isUsernameVisible = serverConfig?.StorageType !== "localstorage";

    if (evt.eventType === "down") {
      if (focused === "username" && isUsernameVisible) {
        passwordInputRef.current?.focus();
      } else if (focused === "password") {
        loginButtonRef.current?.focus();
      }
    }

    if (evt.eventType === "up") {
      if (focused === "button") {
        passwordInputRef.current?.focus();
      } else if (focused === "password" && isUsernameVisible) {
        usernameInputRef.current?.focus();
      }
    }
  };

  useTVEventHandler(tvEventHandler);

  useEffect(() => {
    if (isLoginModalVisible && !isSettingsPage) {
      const isUsernameVisible = serverConfig?.StorageType !== "localstorage";
      setTimeout(() => {
        if (isUsernameVisible) {
          usernameInputRef.current?.focus();
        } else {
          passwordInputRef.current?.focus();
        }
      }, 200);
    }
  }, [isLoginModalVisible, serverConfig, isSettingsPage]);

  const handleLogin = async () => {
    const isLocalStorage = serverConfig?.StorageType === "localstorage";
    if (!password || (!isLocalStorage && !username)) {
      Toast.show({ type: "error", text1: "请输入用户名和密码" });
      return;
    }
    setIsLoading(true);
    try {
      await api.login(isLocalStorage ? undefined : username, password);
      await checkLoginStatus(apiBaseUrl);
      await refreshPlayRecords();
      Toast.show({ type: "success", text1: "登录成功" });
      hideLoginModal();
      setUsername("");
      setPassword("");
    } catch {
      Toast.show({ type: "error", text1: "登录失败", text2: "用户名或密码错误" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={isLoginModalVisible && !isSettingsPage}
      animationType="fade"
      onRequestClose={hideLoginModal}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title}>需要登录</ThemedText>
          <ThemedText style={styles.subtitle}>服务器需要验证您的身份</ThemedText>
          {serverConfig?.StorageType !== "localstorage" && (
            <TextInput
              ref={usernameInputRef}
              style={styles.input}
              placeholder="请输入用户名"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              returnKeyType="next"
              onFocus={() => setFocused("username")}
            />
          )}
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            placeholder="请输入密码"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            returnKeyType="go"
            onFocus={() => setFocused("password")}
            onSubmitEditing={handleLogin}
          />
          <StyledButton
            ref={loginButtonRef}
            onFocus={() => setFocused("button")}
            text={isLoading ? "" : "登录"}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading && <ActivityIndicator color="#fff" />}
          </StyledButton>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#555",
  },
  button: {
    width: "100%",
    height: 50,
  },
});

export default LoginModal;
