import Row from './Row.js';
import train from './images/train.png';
import ferry from './images/ferry.png';

function App() {
  return (
    <div>
      {/* Original color from PATH website is rgb(70, 156, 35).
        * Lightened 50% using https://pinetools.com/lighten-color */}
      <Row icon={train} row_title="PATH to WTC" background_color="#99e17c" />
      {/* Original color from PATH website is rgb(240, 171, 67).
        * Lightened 50% using https://pinetools.com/lighten-color */}
      <Row icon={train} row_title="PATH to 33rd" background_color="#f7d5a1" />
      <Row icon={ferry} row_title="Ferry to Brookfield" background_color="#d0e0e3" />
    </div>
  );
}

export default App;
