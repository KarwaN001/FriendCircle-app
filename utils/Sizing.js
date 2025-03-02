import {Dimensions} from 'react-native';
import Orientation from 'react-native-orientation-locker';

let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;

if (
  Orientation.getInitialOrientation() == 'LANDSCAPE-LEFT' ||
  Orientation.getInitialOrientation() == 'LANDSCAPE-RIGHT'
) {
  width = Dimensions.get('window').height;
  height = Dimensions.get('window').width;
}

export const ResponsiveSize = size => parseFloat((size * width).toFixed(3));

export default Sizing = {
  deviceWidth: width,
  deviceHeight: height,
}; 