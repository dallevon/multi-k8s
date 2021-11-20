import axios, { AxiosError } from 'axios';
import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import styles from './App.module.scss';

const Fib: React.FC = () => {
  const [seenIndexes, setSeeenIndexes] = useState([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [index, setIndex] = useState('');
  const [error, setError] = useState('');
  const mounted = useRef(true);
  const previouslySeen = useRef([]);
  const previousValues = useRef({});
  const dataFetched = useRef(false);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const fetchValues = async () => {
      try {
        const { data } = await axios.get('/api/values/current', {
          cancelToken: source.token
        });
        dataFetched.current = true;
        if (mounted.current && data !== '' && !isEqual(data, previousValues.current)) {
          previousValues.current = data;
          setValues(data);
        }
      } catch (e) {
        const error = e as AxiosError;
        if (axios.isCancel(error)) {
          console.log(error.message);
        } else {
          const { response } = error;
          console.error(`Error: ${response?.statusText}`);
        }
      }
    };

    !dataFetched.current && fetchValues();

    return () => {
      source.cancel('axios request cancelled');
    };
  });

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const fetchIndexes = async () => {
      try {
        const { data } = await axios.get('/api/values/all', {
          cancelToken: source.token
        });
        dataFetched.current = true;
        if (mounted.current && !isEqual(data, previouslySeen.current)) {
          previouslySeen.current = data;
          setSeeenIndexes(data);
        }
      } catch (e) {
        const error = e as AxiosError;
        if (axios.isCancel(error)) {
          console.log(error.message);
        } else {
          const { response } = error;
          console.error(`Error: ${response?.statusText}`);
        }
      }
    };

    !dataFetched.current && fetchIndexes();

    return () => {
      source.cancel('axios request cancelled');
    };
  });

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIndex(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      try {
        await axios.post('/api/values', { index });
        if (mounted.current) {
          dataFetched.current = false;
          setIndex('');
          setError('');
        }
      } catch (e) {
        if (mounted.current) {
          const error = e as AxiosError;
          const { response } = error;
          if (response?.status === 422) {
            setError(response?.data);
          } else {
            setError(`Error ${response?.status}`);
          }
        }
      }
    },
    [index]
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input value={index} onChange={handleChange} />
        <button type="submit">Submit</button>
      </form>
      <p className={styles.error}>{error}</p>

      <h3>Indexes I have seen:</h3>
      {seenIndexes.map(({ number }) => number).join(', ')}

      <h3>Calculated Values:</h3>
      {Object.entries(values).map(([key, value]) => (
        <div key={key}>
          For index {key}
          {value.includes('Index too high')
            ? ' it would take to much time to calculate'
            : value === 'Nothing yet!'
            ? ' ...please refresh the page. I am still calculating'
            : ` I calculated ${value}`}
        </div>
      ))}
    </div>
  );
};

export default Fib;
