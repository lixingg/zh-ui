module.exports = {
  preset: 'ts-jest',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{vue,js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{vue,js,jsx,ts,tsx}',
    '<rootDir>/packages/**/__tests__/**/*.{vue,js,jsx,ts,tsx}',
    '<rootDir>/packages/**/*.{spec,test}.{vue,js,jsx,ts,tsx}'
  ],
  testEnvironment: 'jsdom',
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '\\.vue?$': 'vue-jest',
    '\\.tsx$': 'ts-jest',
    '\\+.ts$': 'ts-jest'
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/',
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss|less)$'
  ],
  moduleFileExtensions: ['vue', 'js', 'jsx', 'ts', 'tsx', 'json', 'node']
}
