import { StatusBar } from 'react-native';
import { openDatabase, getDatabase } from './src/db/client';
import { runMigrations } from './src/db/migrations';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/utils/colors';

openDatabase();
runMigrations(getDatabase());

function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.surface} />
      <RootNavigator />
    </>
  );
}

export default App;
