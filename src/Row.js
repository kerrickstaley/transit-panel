import './Row.css';

export default function Row(props) {
  let {row_title, icon, background_color} = props;
  return <div className="row" style={{backgroundColor: background_color}}>
      <div className="row-title-and-icon">
          <div className="row-title">{row_title}</div>
          <img src={icon} />
      </div>
      <div className="leave-in-min">?</div>
      <div className="spacer"></div>
      <div className="method">?</div>
  </div>;
}
