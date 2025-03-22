const genStatusLabel = (status): string => {
  switch (status) {
    case 'active':
      return 'Đang kích hoạt';
    case 'unactive':
      return 'Chưa kích hoạt';
    case 'deleted':
      return 'Đã bị xoá';
    case 'blocked':
      return 'Đã bị khoá';
    case 'success':
      return 'Thành công';
    case 'failed':
      return 'Thât bại';
    default:
      return 'Không xác định';
  }
};

export { genStatusLabel };
