import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import ModeSelectScreen from '../screens/ModeSelectScreen';
import HomeScreen from '../screens/HomeScreen';
import FeedScreen from '../screens/FeedScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import LessonFieldScreen from '../screens/LessonFieldScreen';
import LessonLevelScreen from '../screens/LessonLevelScreen';
import LessonListScreen from '../screens/LessonListScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import { colors } from '../utils/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.onSurface,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="ModeSelect" component={ModeSelectScreen} options={{ title: 'DevDrill' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Quizzes' }} />
        <Stack.Screen
          name="Feed"
          component={FeedScreen}
          options={({ route }) => ({ title: route.params.categoryName })}
        />
        <Stack.Screen name="Bookmarks" component={BookmarksScreen} options={{ title: 'Bookmarks' }} />
        <Stack.Screen name="LessonField" component={LessonFieldScreen} options={{ title: 'Lessons' }} />
        <Stack.Screen
          name="LessonLevel"
          component={LessonLevelScreen}
          options={({ route }) => ({ title: route.params.categoryName })}
        />
        <Stack.Screen
          name="LessonList"
          component={LessonListScreen}
          options={({ route }) => ({
            title: `${route.params.categoryName} - ${route.params.levelLabel}`,
          })}
        />
        <Stack.Screen
          name="LessonDetail"
          component={LessonDetailScreen}
          options={({ route }) => ({ title: route.params.lessonTitle })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
