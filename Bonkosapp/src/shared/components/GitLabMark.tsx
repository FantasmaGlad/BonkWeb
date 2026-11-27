export function GitLabMark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <polygon points="16 28.896 21.156 13.029 10.844 13.029 16 28.896" fill="#e24329" />
      <polygon points="16 28.896 10.844 13.029 3.619 13.029 16 28.896" fill="#fc6d26" />
      <path d="M3.619,13.029L2.052,17.851a1.067,1.067,0,0,0,.388,1.193L16,28.9Z" fill="#fca326" />
      <path d="M3.619,13.029h7.225L7.739,3.473a.534.534,0,0,0-1.015,0Z" fill="#e24329" />
      <polygon points="16 28.896 21.156 13.029 28.381 13.029 16 28.896" fill="#fc6d26" />
      <path d="M28.381,13.029l1.567,4.822a1.067,1.067,0,0,1-.388,1.193L16,28.9Z" fill="#fca326" />
      <path d="M28.381,13.029H21.156l3.105-9.557a.534.534,0,0,1,1.015,0Z" fill="#e24329" />
    </svg>
  );
}
