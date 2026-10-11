// Nội quy mặc định — hiển thị khi chưa gọi API rules hoặc API chưa trả dữ liệu
const DEFAULT_RULES = [
  'Cấm dẫn thú cưng vào khách sạn',
  'Cấm sử dụng chất cấm trong khuôn viên khách sạn',
  'Không được gây gổ, đánh nhau',
  'Không được làm hư hại tài sản của khách sạn'
];

export default function RulesList({ rules }) {
  const list = rules && rules.length > 0 ? rules.map((r) => r.content) : DEFAULT_RULES;

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Nội quy khách sạn</h3>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {list.map((content, index) => (
          <li key={index} style={{ marginBottom: 8 }}>
            {content}
          </li>
        ))}
      </ol>
    </div>
  );
}