import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Function to get current dimensions, useful for responsive calculations
const getCurrentDimensions = () => {
    const dimension = Dimensions.get('window');
    return {
        width: dimension.width,
        height: dimension.height
    };
};

// Add event listener for dimension changes
Dimensions.addEventListener('change', () => {
    const { width: newWidth, height: newHeight } = getCurrentDimensions();
    Sizing.deviceWidth = newWidth;
    Sizing.deviceHeight = newHeight;
});

export const ResponsiveSize = size => parseFloat((size * width).toFixed(3));

const Sizing = {
    deviceWidth: width,
    deviceHeight: height,
};

export default Sizing; 