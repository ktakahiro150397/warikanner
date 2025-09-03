// 1. forwardRef を React から import
import { forwardRef, useId } from 'react';
import { cn } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// 2. コンポーネント全体を forwardRef でラップする
export const Input = forwardRef<HTMLInputElement, InputProps>(
  // 3. props と一緒に第二引数として ref を受け取る
  ({ label, error, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;

    return (
      <div className="space-y-2 relative">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
        )}
        <input
          id={inputId}
          // 4. 受け取った ref を実際の <input> 要素に渡す
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {/* <div className='min-h-[1.25rem]'> */}
          {error && (
            <p className="text-sm text-red-600 absolute top-full left-0 mt-1">
            {error}
          </p>
          )}
        {/* </div> */}
      </div>
    );
  }
);

// 5. デバッグ時にコンポーネント名が正しく表示されるように displayName を設定
Input.displayName = 'Input';