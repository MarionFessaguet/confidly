# dataprotector deserializer module
import os


def get(path: str):
    IEXEC_IN = os.getenv('IEXEC_IN')
    IEXEC_DATASET_FILENAME = os.getenv('IEXEC_DATASET_FILENAME')

    if IEXEC_DATASET_FILENAME == None:
        raise Exception('Missing protected data')

    dataset_file_path = os.path.join(IEXEC_IN, IEXEC_DATASET_FILENAME)

    try:
        with open(dataset_file_path, 'r') as file:
            return file.read()
    except:
        raise Exception(f"Failed to load path {path}")
