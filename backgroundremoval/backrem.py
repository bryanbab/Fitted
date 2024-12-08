from flask import Flask, request, jsonify
from rembg import remove
import io
from PIL import Image
import base64

app = Flask(__name__)

@app.route('/remove-background', methods=['POST'])
def remove_background():
    try:
        # Get the image from the request
        image_file = request.files['image']
        image_data = image_file.read()

        # Remove the background using rembg
        output_data = remove(image_data)

        # Convert to base64 string
        output_base64 = base64.b64encode(output_data).decode('utf-8')

        # Return the processed image as base64
        return jsonify({'status': 'success', 'image': output_base64})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


